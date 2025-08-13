vcl 4.1;

backend default {
    .host = "nginx";
    .port = "8080";
}

sub vcl_recv {
    # Remove port from host header
    set req.http.Host = regsub(req.http.Host, ":[0-9]+", "");
    
    # Allow purging
    if (req.method == "PURGE") {
        if (!client.ip ~ purge) {
            return(synth(405,"Not allowed."));
        }
        return(purge);
    }

    # Only cache GET and HEAD requests
    if (req.method != "GET" && req.method != "HEAD") {
        return(pass);
    }

    # Remove cookies for static content
    if (req.url ~ "\.(css|js|png|gif|jp(e)?g|swf|ico|woff|woff2|svg)(\?.*|)$") {
        unset req.http.Cookie;  # Changed from 'remove' to 'unset'
    }

    # Don't cache admin or login pages
    if (req.url ~ "^/(admin|login|register|logout)") {
        return(pass);
    }

    # Don't cache pages with cookies (logged in users)
    if (req.http.Cookie ~ "(laravel_session|XSRF-TOKEN)") {
        return(pass);
    }

    return(hash);
}

sub vcl_backend_response {
    # Set cache time for static content
    if (bereq.url ~ "\.(css|js|png|gif|jp(e)?g|swf|ico|woff|woff2|svg)(\?.*|)$") {
        set beresp.ttl = 1w;
        set beresp.http.Cache-Control = "public, max-age=604800";
    }

    # Set cache time for HTML content
    if (beresp.http.Content-Type ~ "text/html") {
        set beresp.ttl = 5m;
    }

    # Don't cache if there are cookies
    if (beresp.http.Set-Cookie) {
        set beresp.ttl = 0s;
        set beresp.uncacheable = true;
        return(deliver);
    }

    return(deliver);
}

sub vcl_deliver {
    # Add cache status header for debugging
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT";
        set resp.http.X-Cache-Hits = obj.hits;
    } else {
        set resp.http.X-Cache = "MISS";
    }

    # Remove server information for security
    unset resp.http.Server;  # Changed from 'remove' to 'unset'
    unset resp.http.X-Powered-By;  # Changed from 'remove' to 'unset'

    return(deliver);
}

# Define purge ACL
acl purge {
    "localhost";
    "127.0.0.1";
    "172.16.0.0"/12;
}