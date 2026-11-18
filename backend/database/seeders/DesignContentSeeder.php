<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

/**
 * Re-applies the content migrations that shape the seeded content into the Figma designs (program page
 * modules, the "All Programs" listing sections, partner labels, spelling fixes).
 *
 * Those migrations only change content that already exists, so on a fresh install (`migrate --seed`)
 * they run before ContentSeeder has created anything and do nothing. Running them again after seeding
 * brings the content in line with the designs. Each one checks what is already there, so this is safe
 * to run more than once.
 */
class DesignContentSeeder extends Seeder
{
    public const MIGRATIONS = [
        '2026_10_31_074324_move_program_sections_into_program_details.php',
        '2026_10_31_075304_add_programme_sections_to_programs_page.php',
        '2026_10_31_095919_move_program_partner_labels_into_their_own_field.php',
        '2026_11_02_102058_correct_visakhapatnam_spelling.php',
    ];

    public function run(): void
    {
        foreach (self::MIGRATIONS as $file) {
            (require database_path('migrations/'.$file))->up();
        }

        // Public pages are cached; clear them so the new content shows straight away.
        Cache::flush();
    }
}
