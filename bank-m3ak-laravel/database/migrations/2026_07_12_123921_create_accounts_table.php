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
Schema::create('accounts', function (Blueprint $table) {
    $table->string('account_no')->primary();

    $table->foreignId('owner_id')
          ->constrained('users')
          ->cascadeOnDelete();

    $table->string('owner_name');

    $table->decimal('balance',15,2)->default(0);

    $table->enum('status',[
        'Actif',
        'Désactivé'
    ])->default('Actif');

    $table->boolean('pending_validation')->default(false);

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
