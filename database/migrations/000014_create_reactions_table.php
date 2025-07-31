<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('emoji', 8);
            $table->morphs('reactable'); // This creates reactable_id and reactable_type columns
            $table->timestamps();

            // Ensure a user can only have one reaction per reactable item
            $table->unique(['user_id', 'reactable_id', 'reactable_type']);
            
            // Index for better performance
            $table->index(['reactable_id', 'reactable_type']);
            $table->index(['user_id', 'reactable_id', 'reactable_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reactions');
    }
};