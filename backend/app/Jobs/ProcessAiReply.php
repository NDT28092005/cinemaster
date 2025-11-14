<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Message;
use App\Events\MessageSent;
use Illuminate\Support\Facades\Http;
use Illuminate\Foundation\Bus\Dispatchable;

class ProcessAiReply implements ShouldQueue
{
    use Queueable, SerializesModels,Dispatchable;

    public $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    public function handle()
    {
        $prompt = "Khách hỏi: " . $this->message->content .
                  "\nHãy trả lời ngắn gọn, thân thiện và có gợi ý sản phẩm.";

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('AI_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post(env('AI_API_URL'), [
            'prompt' => $prompt,
            'max_tokens' => 300
        ]);

        $botReply = $response->json()['reply'] ?? "Cảm ơn bạn! Shop sẽ phản hồi sớm nhất.";

        // Lưu message mới
        $newMessage = Message::create([
            'conversation_id' => $this->message->conversation_id,
            'user_id' => null,
            'sender_type' => 'bot',
            'content' => $botReply
        ]);

        broadcast(new MessageSent($newMessage))->toOthers();
    }
}
