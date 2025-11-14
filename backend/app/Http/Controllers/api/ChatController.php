<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Conversation;
use App\Events\MessageSent;
use App\Jobs\ProcessAiReply;

class ChatController extends Controller
{
    public function start(Request $request)
    {
        $user = $request->user();

        $conv = Conversation::firstOrCreate(['user_id' => $user->id]);

        return response()->json($conv);
    }

    public function messages(Request $request, $conversationId)
    {
        $messages = Message::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    public function send(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|integer',
            'content' => 'required|string'
        ]);

        $msg = Message::create([
            'conversation_id' => $request->conversation_id,
            'sender_type'     => $request->sender_type ?? 'user',
            'content'         => $request->input('content')
        ]);

        broadcast(new MessageSent($msg))->toOthers();

        // Gửi AI reply
        dispatch(new \App\Jobs\AIReplyJob($msg->id));

        return response()->json($msg);
    }
}
