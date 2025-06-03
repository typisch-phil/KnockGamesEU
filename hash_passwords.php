<?php
require_once 'config.php';

// Hash all existing passwords in JSON storage
$storage = new JsonStorage();
$users = $storage->read('users');

$updated = false;
foreach ($users as &$user) {
    // Check if password is already hashed (starts with $2y$)
    if (!empty($user['password']) && !str_starts_with($user['password'], '$2y$')) {
        echo "Hashing password for user: " . $user['username'] . "\n";
        $user['password'] = password_hash($user['password'], PASSWORD_DEFAULT);
        $updated = true;
    }
}

if ($updated) {
    $storage->write('users', $users);
    echo "Passwords updated successfully!\n";
} else {
    echo "All passwords are already hashed.\n";
}

// Display all users with their hashed passwords (for verification)
echo "\nCurrent users:\n";
foreach ($users as $user) {
    echo "- " . $user['username'] . " (" . $user['role'] . "): " . 
         substr($user['password'], 0, 20) . "...\n";
}
?>