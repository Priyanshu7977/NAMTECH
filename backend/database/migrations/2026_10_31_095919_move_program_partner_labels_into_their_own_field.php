<?php

use App\Models\Program;
use Illuminate\Database\Migrations\Migration;

/**
 * Program partner titles such as "Academic Partner: TUM Asia" become label "Academic Partner"
 * and name "TUM Asia", now that partner cards have their own label field.
 */
return new class extends Migration
{
    public function up(): void
    {
        Program::query()->whereNotNull('details')->each(function (Program $program): void {
            $details = $program->details;
            $items = $details['partners']['items'] ?? [];
            $changed = false;

            foreach ($items as $i => $item) {
                if (empty($item['tag']) && preg_match('/^([^:]{3,40}):\s*(.+)$/', (string) ($item['title'] ?? ''), $m)) {
                    $items[$i]['tag'] = trim($m[1]);
                    $items[$i]['title'] = trim($m[2]);
                    $changed = true;
                }
            }

            if ($changed) {
                $details['partners']['items'] = $items;
                $program->details = $details;
                $program->saveQuietly();
            }
        });
    }

    public function down(): void
    {
        // Labels stay in their own field.
    }
};
