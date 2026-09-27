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
        Schema::table('users', function (Blueprint $table) {
            $table->string('status')->default('Inactif')->after('email');
            $table->integer('cvs_created')->default(0)->after('status');
            $table->integer('pdf_exports')->default(0)->after('cvs_created');
            $table->decimal('subscription_price', 8, 2)->nullable()->after('pdf_exports');
            $table->timestamp('subscription_end_date')->nullable()->after('subscription_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status', 'cvs_created', 'pdf_exports', 'subscription_price', 'subscription_end_date']);
        });
    }
};
