<?php

namespace App\Http\Controllers; 

use App\Events\SocketMessage;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Group;
use App\Models\Message; 
use App\Models\MessageAttachment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller 
{
    public function byUser(User $user)
    {
        $messages = Message::where('sender_id', auth()->id()) 
            ->where('receiver_id', $user->id)
            ->orWhere('sender_id', $user->id)
            ->where('receiver_id', auth()->id())
            ->latest()
            ->paginate(10); 

        return inertia('Home', [
            'selectedConversation' => $user->toConversationArray(),
            'messages' => MessageResource::collection($messages)
        ]);
    }

    public function byGroup(Group $group)
    {
        $messages = Message::where('group_id', $group->id)
            ->latest()
            ->paginate(10); 

        return inertia('Home', [
            'selectedConversation' => $group->toConversationArray(),
            'messages' => MessageResource::collection($messages)
        ]);
    }

    public function loadOlder(Message $message)
    {
        // Load older messages that are older than the given message, sort them by the latest
        if ($message->group_id) {
            $messages = Message::where('created_at', '<', $message->created_at)
                ->where('group_id', $message->group_id)
                ->latest()
                ->paginate(10);
        } else {
            $messages = Message::where('created_at', '<', $message->created_at)
                ->where(function ($query) use ($message) {
                    $query->where('sender_id', $message->sender_id)
                        ->where('receiver_id', $message->receiver_id)
                        ->orWhere('sender_id', $message->receiver_id)
                        ->where('receiver_id', $message->sender_id);
                })
                ->latest()
                ->paginate(10);
        }
 
        // Return the messages as a resource
        return MessageResource::collection($messages);
    }

    public function store(StoreMessageRequest $request)
    {
        try {
            return DB::transaction(function () use ($request) {
                $data = $request->validated();
                $data['sender_id'] = auth()->id();
                $receiverId = $data['receiver_id'] ?? null;
                $groupId = $data['group_id'] ?? null;
                $files = $data['attachments'] ?? [];

                $message = Message::create($data);
                $attachments = [];
                $storedPaths = [];

                if ($files) {
                    // Ensure directory exists
                    $directory = 'msg_attachments/' . $message->id;
                    Storage::disk('public')->makeDirectory($directory);

                    foreach ($files as $file) {
                        try {
                            $path = $file->store($directory, 'public');
                            if (!$path) {
                                throw new \Exception('Failed to store file');
                            }
                            $storedPaths[] = $path;

                            $model = [
                                'message_id' => $message->id,
                                'name' => $file->getClientOriginalName(),
                                'mime' => $file->getClientMimeType(),
                                'size' => $file->getSize(),
                                'path' => $path
                            ];
                            $attachment = MessageAttachment::create($model);
                            $attachments[] = $attachment;
                        } catch (\Exception $e) {
                            // Clean up any stored files before re-throwing
                            foreach ($storedPaths as $storedPath) {
                                Storage::disk('public')->delete($storedPath);
                            }
                            Storage::disk('public')->deleteDirectory($directory);
                            throw $e;
                        }
                    }
                    $message->attachments = $attachments;
                }

                if ($receiverId) {
                    Conversation::updateConversationWithMessage($receiverId, auth()->id(), $message);
                }

                if ($groupId) {
                    Group::updateGroupWithMessage($groupId, $message);
                }

                SocketMessage::dispatch($message);

                return new MessageResource($message);
            });
        } catch (\Exception $e) {
            Log::error('Message creation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create message',
                'error' => config('app.debug') ? $e->getMessage() : 'Server Error'
            ], 500);
        }
    }

    /** 
     * Remove the specified resource from storage
     */
    public function destroy(Message $message)
    {
        // Check if the user is the owner of the message
        if ($message->sender_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return DB::transaction(function() use ($message) {
            $group = null;
            $conversation = null;
            
            // Handle group message
            if ($message->group_id) {
                $group = Group::where('last_message_id', $message->id)->first();
                if ($group) {
                    $previousMessage = Message::where('group_id', $group->id)
                        ->where('id', '!=', $message->id)
                        ->latest()
                        ->first();
                    
                    $group->update(['last_message_id' => $previousMessage ? $previousMessage->id : null]);
                }
            } 
            // Handle conversation message
            else {
                $conversation = Conversation::where('last_message_id', $message->id)->first();
                if ($conversation) {
                    $previousMessage = Message::where(function ($query) use ($conversation) {
                            $query->where('sender_id', $conversation->user_id)
                                ->where('receiver_id', $conversation->other_user_id)
                                ->orWhere('sender_id', $conversation->other_user_id)
                                ->where('receiver_id', $conversation->user_id);
                        })
                        ->where('id', '!=', $message->id)
                        ->latest()
                        ->first();
                    
                    $conversation->update(['last_message_id' => $previousMessage ? $previousMessage->id : null]);
                }
            }

            // Delete message (MessageObserver will handle attachments)
            $message->delete();

            // Return the previous message as the new last message
            if ($group || $conversation) {
                $lastMessage = $group ? 
                    Group::find($group->id)->lastMessage : 
                    Conversation::find($conversation->id)->lastMessage;
                
                return response()->json([
                    'message' => $lastMessage ? new MessageResource($lastMessage) : null
                ]);
            }

            return response()->json(['message' => null]);
        });
    }

}
