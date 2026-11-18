<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            AdminUserSeeder::class,
            ContentSeeder::class,
            // Content migrations ran before the content existed; apply them now (see DesignContentSeeder).
            DesignContentSeeder::class,
        ]);
    }
}
