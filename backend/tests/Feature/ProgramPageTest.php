<?php

namespace Tests\Feature;

use App\Models\Enquiry;
use App\Models\Media;
use App\Models\Page;
use App\Models\Program;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Tests\PageAssert as Assert;
use Tests\TestCase;

class ProgramPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_program_modules_are_edited_in_the_cms_and_hidden_items_stay_off_the_page(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->post('/admin/content/programs', [
            'title' => 'Master in Robotics', 'slug' => 'master-in-robotics', 'level' => 'postgraduate',
            'why_choose' => ['heading' => null, 'items' => [
                ['icon' => 'robot', 'title' => 'Cutting Edge Labs', 'text' => 'Industrial robot cells.'],
                ['title' => 'Draft reason', '_hidden' => true],
            ]],
            'fees' => ['total' => 'Rs. 4,50,000', 'rows' => [['label' => 'Tuition Fee', 'value' => 'Rs. 2,50,000']]],
        ])->assertRedirect()->assertSessionHasNoErrors();

        $program = Program::query()->where('slug', 'master-in-robotics')->firstOrFail();
        $this->assertSame('Cutting Edge Labs', $program->details['why_choose']['items'][0]['title']);
        $this->assertTrue($program->details['why_choose']['items'][1]['_hidden']);
        $this->assertSame('Rs. 4,50,000', $program->details['fees']['total']);

        // The edit form shows each module from the stored details.
        $this->actingAs($admin)->get("/admin/content/programs/{$program->id}/edit")->assertOk()
            ->assertPage(fn (Assert $page) => $page->where('values.fees.total', 'Rs. 4,50,000'));

        $this->publish($program);
        auth()->logout();
        $this->get('/programs/master-in-robotics')->assertOk()->assertPage(fn (Assert $page) => $page
            ->component('site/programs/Show')
            ->has('details.why_choose.items', 1)
            ->where('details.why_choose.items.0.title', 'Cutting Edge Labs')
            ->where('details.fees.rows.0.value', 'Rs. 2,50,000')
            ->where('tabs.fees', 'Fees & Scholarship'));
    }

    public function test_every_program_module_can_be_switched_off(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->post('/admin/content/programs', [
            'title' => 'B.Tech Robotics', 'slug' => 'btech-robotics', 'level' => 'undergraduate',
            'hidden_blocks' => ['fees', 'life_alumni', 'enquire'],
        ])->assertSessionHasNoErrors();

        $this->publish(Program::query()->where('slug', 'btech-robotics')->firstOrFail());
        auth()->logout();
        $this->get('/programs/btech-robotics')->assertPage(fn (Assert $page) => $page->where('hidden', ['fees', 'life_alumni', 'enquire']));
    }

    public function test_the_brochure_form_saves_a_lead_then_offers_the_download(): void
    {
        Queue::fake();
        $brochure = Media::create([
            'uuid' => (string) Str::uuid(), 'kind' => 'document', 'disk' => 'public', 'directory' => 'documents', 'filename' => 'robotics.pdf',
            'original_name' => 'robotics.pdf', 'mime_type' => 'application/pdf', 'size' => 1024, 'status' => 'ready',
        ]);
        $program = $this->publish(Program::create(['title' => 'Master in Robotics', 'slug' => 'master-in-robotics', 'level' => 'postgraduate', 'details' => ['brochure' => ['file' => $brochure->id]]]));

        $form = ['type' => 'brochure', 'program_id' => $program->id, 'name' => 'Asha Patel', 'email' => 'asha@example.com', 'consent' => true, 'website' => '', 'elapsed' => 6000];

        $this->post('/enquiries', $form)->assertSessionHasErrors(['grade', 'city']);

        $this->from('/programs/master-in-robotics')->post('/enquiries', $form + ['grade' => 'Graduate', 'city' => 'Ahmedabad'])
            ->assertRedirect('/programs/master-in-robotics')
            ->assertSessionHas('form_success.download', $brochure->documentUrl());

        $enquiry = Enquiry::query()->firstOrFail();
        $this->assertSame('brochure', $enquiry->type);
        $this->assertStringContainsString('Ahmedabad', $enquiry->message);
    }

    public function test_the_programs_page_lists_programmes_by_level(): void
    {
        $this->publish(Program::create(['title' => 'B.Tech Robotics', 'slug' => 'btech-robotics', 'level' => 'undergraduate']));
        $this->publish(Program::create(['title' => 'Master in Robotics', 'slug' => 'master-in-robotics', 'level' => 'postgraduate']));
        $page = $this->page('Programs', 'programs');
        $page->sections()->create(['type' => 'program_levels', 'is_visible' => true, 'sort_order' => 1, 'data' => ['items' => [
            ['level' => 'undergraduate', 'heading' => 'Bachelors Programmes'],
            ['level' => 'postgraduate', 'heading' => 'Masters Programmes'],
        ]]]);

        $this->get('/programs')->assertOk()->assertPage(fn (Assert $p) => $p
            ->component('site/programs/Index')
            ->where('sections.0.data.items.0.programs.0.title', 'B.Tech Robotics')
            ->where('sections.0.data.items.1.programs.0.url', '/programs/master-in-robotics'));
    }
}
