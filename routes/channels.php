<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('public-driver-locations', function ($user) {
    return true;
});

Broadcast::channel('driver.{driverId}', function ($user, $driverId) {
    return (int) $user->driver->id === (int) $driverId;
});

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
