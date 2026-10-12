<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([

            [
                'id'=>1,
                'name'=>'Nadia Idrahou',
                'email'=>'nadiaidrahou03@gmail.com',
                'password'=>Hash::make('admin123'),
                'phone'=>'0661234567',
                'address'=>'Casablanca',
                'role'=>'Administrateur',
                'active'=>true,
            ],
            [
                'id'=>2,
                'name'=>'Gramir Rachida',
                'email'=>'rachida@bankm3ak.ma',
                'password'=>Hash::make('admin123'),
                'phone'=>'0662345678',
                'address'=>'Rabat',
                'role'=>'Administrateur',
                'active'=>true,
            ],
            [
                'id'=>3,
                'name'=>'Chaimae El Idrissi',
                'email'=>'chaimae@bankm3ak.ma',
                'password'=>Hash::make('admin123'),
                'phone'=>'0663456789',
                'address'=>'Marrakech',
                'role'=>'Administrateur',
                'active'=>true,
            ],
            [
                'id'=>4,
                'name'=>'Ahmed Alaoui',
                'email'=>'ahmed@gmail.com',
                'password'=>Hash::make('123456'),
                'phone'=>'0612345678',
                'address'=>'Casablanca',
                'role'=>'Utilisateur',
                'active'=>true,
            ],
            [
                'id'=>5,
                'name'=>'Fatima Zahra',
                'email'=>'fatima@gmail.com',
                'password'=>Hash::make('123456'),
                'phone'=>'0623456789',
                'address'=>'Rabat',
                'role'=>'Utilisateur',
                'active'=>true,
            ],
            [
                'id'=>6,
                'name'=>'Youssef Benali',
                'email'=>'youssef@gmail.com',
                'password'=>Hash::make('123456'),
                'phone'=>'0634567890',
                'address'=>'Marrakech',
                'role'=>'Utilisateur',
                'active'=>true,
            ],
            [
                'id'=>7,
                'name'=>'Sara Chraibi',
                'email'=>'sara@gmail.com',
                'password'=>Hash::make('123456'),
                'phone'=>'0645678901',
                'address'=>'Fès',
                'role'=>'Utilisateur',
                'active'=>true,
            ],
            [
                'id'=>8,
                'name'=>'Hamza El Fassi',
                'email'=>'hamza@gmail.com',
                'password'=>Hash::make('123456'),
                'phone'=>'0656789012',
                'address'=>'Tanger',
                'role'=>'Utilisateur',
                'active'=>true,
            ],
            [
                'id'=>9,
                'name'=>'Imane Bennis',
                'email'=>'imane@gmail.com',
                'password'=>Hash::make('123456'),
                'phone'=>'0667890123',
                'address'=>'Agadir',
                'role'=>'Utilisateur',
                'active'=>true,
            ],
            [
                'id'=>10,
                'name'=>'Mehdi Tazi',
                'email'=>'mehdi@gmail.com',
                'password'=>Hash::make('123456'),
                'phone'=>'0678901234',
                'address'=>'Casablanca',
                'role'=>'Utilisateur',
                'active'=>true,
            ],
            [
                'id'=>11,
                'name'=>'Salma Amrani',
                'email'=>'salma@gmail.com',
                'password'=>Hash::make('123456'),
                'phone'=>'0689012345',
                'address'=>'Rabat',
                'role'=>'Utilisateur',
                'active'=>true,
            ],
            [
                'id'=>12,
                'name'=>'Othmane Berrada',
                'email'=>'othmane@gmail.com',
                'password'=>Hash::make('123456'),
                'phone'=>'0690123456',
                'address'=>'Marrakech',
                'role'=>'Utilisateur',
                'active'=>false,
            ],
            [
                'id'=>13,
                'name'=>'Khadija Lahlou',
                'email'=>'khadija@gmail.com',
                'password'=>Hash::make('123456'),
                'phone'=>'0601234567',
                'address'=>'Fès',
                'role'=>'Utilisateur',
                'active'=>true,
            ],

        ]);
    }
}