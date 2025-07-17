<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    // Extract data
    $userId = $input['userId'] ?? null;
    $avatarURL = $input['avatarURL'] ?? null;
    $avatarBase64 = $input['avatarBase64'] ?? null;
    $displayName = $input['displayName'] ?? null;
    $username = $input['username'] ?? null;
    
    if (!$userId) {
        throw new Exception('userId is required');
    }
    
    // Create sync data structure
    $syncData = [
        'userId' => $userId,
        'profileData' => [
            'name' => $displayName,
            'username' => $username,
            'avatar' => $avatarBase64 ?: $avatarURL,
            'hasAvatar' => !empty($avatarBase64) || !empty($avatarURL),
            'lastUpdated' => date('c'),
            'source' => 'app'
        ],
        'timestamp' => date('c')
    ];
    
    // Store in localStorage-compatible format (for website to read)
    $storageKey = 'websiteProfileSync';
    $storageData = json_encode($syncData);
    
    // For now, we'll store in a simple file
    // In production, you'd use a database
    $storageDir = '../data/';
    if (!is_dir($storageDir)) {
        mkdir($storageDir, 0755, true);
    }
    
    $filename = $storageDir . 'profile_sync_' . $userId . '.json';
    file_put_contents($filename, $storageData);
    
    // Also store in a general sync file for the website
    $generalSyncFile = $storageDir . 'latest_sync.json';
    file_put_contents($generalSyncFile, $storageData);
    
    // Return success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Avatar synced successfully',
        'userId' => $userId,
        'timestamp' => date('c')
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage(),
        'status' => 'error'
    ]);
}
?> 