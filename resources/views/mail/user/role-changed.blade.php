<x-mail::message>
Hello {{ $user->is_admin }},

@if ($user->blocked_at)
You are now admin in the system. You can add and block users.
@else
Your role was changed into regular user. You are no longer able to add or block users
@endif

Thank you, <br>
{{ config('app.name') }}
</x-mail::message>
