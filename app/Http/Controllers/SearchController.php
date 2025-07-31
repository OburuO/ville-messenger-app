<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $search =  $request->search;

        $users = [];

        if (trim($request->search)) {
            $users = User::where('name','LIKE',"%{$search}%")
                ->orWhere('email', 'like', "%$search%")
                ->orWhere('username', 'like', "%$search%")
                ->orderBy('created_at','DESC')->limit(5)->get();

            
            $users = UserResource::collection($users);   
        }

        return $users;
    }
}
