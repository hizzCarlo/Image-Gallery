<?php
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE');
  header('Access-Control-Allow-Headers: Content-Type, Authorization');
  header('Content-Type: application/json');

class Get {
  

    public function get_images() {
        global $conn;
        try {
            $sql = "SELECT id, url, alt FROM images";
            $stmt = $conn->query($sql);
            $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $images;
        } catch (PDOException $e) {
            http_response_code(500);
            return ["error" => "Query failed"];
        }
    }

    public function get_images_by_id($unique_id) {
        global $conn;
        try {
            $sql = "SELECT id, url, alt FROM images WHERE unique_id = :unique_id";
            $stmt = $conn->prepare($sql);
            $stmt->execute(['unique_id' => $unique_id]);
            $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $images;
        } catch (PDOException $e) {
            http_response_code(500);
            return ["error" => "Query failed"];
        }
    }


public function download_image($imageId) {
    global $conn;
    try {
        $sql = "SELECT url FROM images WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute(['id' => $imageId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $fileUrl = $row['url'];
            $filePath = str_replace('http://localhost', $_SERVER['DOCUMENT_ROOT'], $fileUrl);

            if (file_exists($filePath)) {
                if (ob_get_level()) {
                    ob_end_clean();
                }

                header('Content-Description: File Transfer');
                header('Content-Type: ' . mime_content_type($filePath));
                header('Content-Disposition: attachment; filename="'.basename($filePath).'"');
                header('Expires: 0');
                header('Cache-Control: must-revalidate');
                header('Pragma: public');
                header('Content-Length: ' . filesize($filePath));

                $file = fopen($filePath, 'rb');
                fpassthru($file);
                fclose($file);
                exit;
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'File not found']);
            }
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Image not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Query failed']);
    }
}


    public function fetch_image($url) {
        $imageData = file_get_contents($url);

        $fileExtension = pathinfo($url, PATHINFO_EXTENSION);
        switch (strtolower($fileExtension)) {
            case 'jpg':
            case 'jpeg':
                header("Content-Type: image/jpeg");
                break;
            case 'png':
                header("Content-Type: image/png");
                break;
            case 'gif':
                header("Content-Type: image/gif");
                break;
            default:
                header("Content-Type: application/octet-stream");
                break;
        }

        echo $imageData;
    }

    public function fetch_profile($uniqueID) {
        global $conn;

        if (empty($uniqueID)) {
            http_response_code(400);
            return ["error" => "Unique ID is required"];
        }

        try {
            $stmt = $conn->prepare("SELECT aboutMe, age, residence, address, email, phone FROM users WHERE uniqueID = :uniqueID");
            $stmt->bindParam(':uniqueID', $uniqueID);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result) {
                return $result;
            } else {
                return [
                    "aboutMe" => "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean fermentum ullamcorper sem, at placerat dolor volutpat ac. Duis nulla enim, condimentum nec ultricies.",
                    "age" => 0,
                    "residence" => "--",
                    "address" => "--",
                    "email" => "email@example.com",
                    "phone" => "--"
                ];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ["error" => "Failed to fetch profile"];
        }
    }


    public function get_unique_id($username) {
        global $conn;

        if (empty($username)) {
            http_response_code(400);
            return ["error" => "Username is required."];
        }

        try {
            $stmt = $conn->prepare("SELECT unique_id FROM acc WHERE username = :username");
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                http_response_code(200);
                return ["unique_ID" => $user['unique_id']];
            } else {
                http_response_code(404);
                return ["error" => "User not found"];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ["error" => "Query failed"];
        }
    }

}
?>