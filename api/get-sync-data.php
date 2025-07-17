<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $userId = $_GET['userId'] ?? null;
    
    if (!$userId) {
        throw new Exception('userId parameter is required');
    }
    
    $storageDir = '../data/';
    $filename = $storageDir . 'profile_sync_' . $userId . '.json';
    
    if (!file_exists($filename)) {
        // Try general sync file as fallback
        $generalSyncFile = $storageDir . 'latest_sync.json';
        if (file_exists($generalSyncFile)) {
            $data = json_decode(file_get_contents($generalSyncFile), true);
            if ($data && $data['userId'] === $userId) {
                echo json_encode($data);
                exit();
            }
        }
        
        echo json_encode([
            'status' => 'not_found',
            'message' => 'No sync data found for user'
        ]);
        exit();
    }
    
    $data = json_decode(file_get_contents($filename), true);
    
    if (!$data) {
        throw new Exception('Invalid sync data format');
    }
    
    echo json_encode($data);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage(),
        'status' => 'error'
    ]);
}
?> 