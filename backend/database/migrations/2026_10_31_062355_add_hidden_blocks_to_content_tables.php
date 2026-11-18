<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Detail-page blocks an editor has switched off (see App\Support\PageBlocks).
 */
return new class extends Migration
{
    /** @var array<int, string> */
    private array $tables = ['programs', 'schools', 'centres', 'faculty', 'posts', 'events', 'leaders'];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $table): void {
                $table->json('hidden_blocks')->nullable();
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $table): void {
                $table->dropColumn('hidden_blocks');
            });
        }
    }
};
