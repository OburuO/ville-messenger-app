<?php
namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Post;
use App\Models\Reaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReactionController extends Controller
{
    /**
     * React to an entity (message, post, etc.)
     */
    public function react(Request $request, string $type, string $id)
    {
        try {
            $validated = $request->validate([
                'emoji' => [
                    'required',
                    'string',
                    'max:8',
                ],
            ]);

            // Clean the emoji value before using it
            $emoji = $this->cleanEmoji($validated['emoji']);
            
            // Get the model instance
            $model = $this->getModel($type, $id);
            
            // Check if user has any existing reaction
            $existingReaction = $model->reactions()
                ->where('user_id', auth()->id())
                ->first();

            // If same emoji exists, remove it (toggle behavior)
            if ($existingReaction && $existingReaction->emoji === $emoji) {
                $existingReaction->delete();
                
                return response()->json([
                    'message' => 'Reaction removed',
                    'reactions' => $this->getReactionsWithUsers($model)
                ]);
            }

            // If different emoji exists, update it
            if ($existingReaction) {
                $existingReaction->update(['emoji' => $emoji]);
                
                return response()->json([
                    'message' => 'Reaction updated',
                    'reactions' => $this->getReactionsWithUsers($model)
                ]);
            }

            // Create new reaction if none exists
            $reaction = $model->reactions()->create([
                'user_id' => auth()->id(),
                'emoji' => $emoji
            ]);

            return response()->json([
                'message' => 'Reaction added',
                'reactions' => $this->getReactionsWithUsers($model)
            ]);

        } catch (\Exception $e) {
            Log::error('Reaction failed: ' . $e->getMessage(), [
                'type' => $type,
                'id' => $id,
                'user_id' => auth()->id(),
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Failed to process reaction',
                'error' => config('app.debug') ? $e->getMessage() : 'Server Error'
            ], 500);
        }
    }

    /**
     * Get all reactions for an entity
     */
    public function getReactions(string $type, string $id)
    {
        try {
            $model = $this->getModel($type, $id);
            
            return response()->json([
                'reactions' => $this->getReactionsWithUsers($model)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get reactions',
                'error' => config('app.debug') ? $e->getMessage() : 'Server Error'
            ], 500);
        }
    }

    /**
     * Get the appropriate model based on type and id
     */
    private function getModel($type, $id)
    {
        return match ($type) {
            'messages' => Message::findOrFail($id),
            // Add other entity types here as needed
            // 'posts' => Post::findOrFail($id),
            default => abort(404, 'Invalid entity type')
        };
    }

    /**
     * Get reactions with user information
     */
    private function getReactionsWithUsers($model)
    {
        return $model->reactions()
            ->with('user:id,name,username')
            ->get()
            ->map(function ($reaction) {
                return [
                    'id' => $reaction->id,
                    'emoji' => $reaction->emoji,
                    'user_id' => $reaction->user_id,
                    'user' => $reaction->user,
                    'created_at' => $reaction->created_at
                ];
            });
    }

    /**
     * Clean and validate emoji input
     */
    private function cleanEmoji($emoji)
    {
        // Handle JSON encoded emojis
        if (str_starts_with($emoji, '"') && str_ends_with($emoji, '"')) {
            $emoji = json_decode($emoji);
        }
        
        // Clean whitespace
        $emoji = trim($emoji);
        
        // Validate emoji length
        if (mb_strlen($emoji) > 8) {
            throw new \InvalidArgumentException('Emoji too long');
        }
        
        return $emoji;
    }
}