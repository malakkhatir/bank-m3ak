<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccountsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('accounts')->insert([

            [
                'account_no'=>'BM-0010203',
                'owner_id'=>4,
                'owner_name'=>'Ahmed Alaoui',
                'balance'=>15000,
                'status'=>'Actif',
            ],
            [
                'account_no'=>'BM-0020304',
                'owner_id'=>5,
                'owner_name'=>'Fatima Zahra',
                'balance'=>42000,
                'status'=>'Actif',
            ],
            [
                'account_no'=>'BM-0030405',
                'owner_id'=>6,
                'owner_name'=>'Youssef Benali',
                'balance'=>8500,
                'status'=>'Actif',
            ],
            [
                'account_no'=>'BM-0040506',
                'owner_id'=>7,
                'owner_name'=>'Sara Chraibi',
                'balance'=>120000,
                'status'=>'Actif',
            ],
            [
                'account_no'=>'BM-0050607',
                'owner_id'=>8,
                'owner_name'=>'Hamza El Fassi',
                'balance'=>2300,
                'status'=>'Actif',
            ],
            [
                'account_no'=>'BM-0060708',
                'owner_id'=>9,
                'owner_name'=>'Imane Bennis',
                'balance'=>54000,
                'status'=>'Actif',
            ],
            [
                'account_no'=>'BM-0070809',
                'owner_id'=>10,
                'owner_name'=>'Mehdi Tazi',
                'balance'=>1200,
                'status'=>'Actif',
            ],
            [
                'account_no'=>'BM-0080910',
                'owner_id'=>11,
                'owner_name'=>'Salma Amrani',
                'balance'=>35000,
                'status'=>'Actif',
            ],
            [
                'account_no'=>'BM-0091011',
                'owner_id'=>12,
                'owner_name'=>'Othmane Berrada',
                'balance'=>0,
                'status'=>'Désactivé',
            ],
            [
                'account_no'=>'BM-0101112',
                'owner_id'=>13,
                'owner_name'=>'Khadija Lahlou',
                'balance'=>7100,
                'status'=>'Actif',
            ],

        ]);
    }
}