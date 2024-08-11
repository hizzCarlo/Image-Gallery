<?php
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE');
  header('Access-Control-Allow-Headers: Content-Type, Authorization');
  header('Content-Type: application/json');

class Post {
    

public function login($data) {
    global $conn;
    $username = filter_var($data['username'] ?? null, FILTER_SANITIZE_STRING);
    $password = $data['password'] ?? null;

    if (empty($username) || empty($password)) {
        http_response_code(400);
        return ["error" => "Username and password are required."];
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM acc WHERE username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            http_response_code(200);
            return ["message" => "Login successful", "username" => $user['username'], "unique_ID" => $user['unique_id']];
        } else {
            http_response_code(401);
            return ["error" => "Invalid credentials"];
        }
    } catch (PDOException $e) {
        http_response_code(500);
        return ["error" => "Query failed"];
    }
}

    public function register($data) {
        global $conn;
        $username = filter_var($data['username'] ?? null, FILTER_SANITIZE_STRING);
        $password = $data['password'] ?? null;

        if (empty($username) || empty($password)) {
            http_response_code(400);
            return ["error" => "Username and password are required."];
        }

        function generateUniqueCode($conn) {
            $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            do {
                $uniqueID = '';
                for ($i = 0; $i < 8; $i++) {
                    $uniqueID .= $characters[rand(0, strlen($characters) - 1)];
                }
                $checkCodeStmt = $conn->prepare("SELECT * FROM acc WHERE unique_id = :unique_id");
                $checkCodeStmt->bindParam(':unique_id', $uniqueID);
                $checkCodeStmt->execute();
            } while ($checkCodeStmt->rowCount() > 0);
            return $uniqueID;
        }

        try {
            $checkStmt = $conn->prepare("SELECT * FROM acc WHERE username = :username");
            $checkStmt->bindParam(':username', $username);
            $checkStmt->execute();
            if ($checkStmt->rowCount() > 0) {
                http_response_code(409);
                return ["error" => "Username already exists."];
            }

            $uniqueID = generateUniqueCode($conn);
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $conn->prepare("INSERT INTO acc (username, password, unique_id) VALUES (:username, :password, :unique_id)");
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':password', $hashedPassword);
            $stmt->bindParam(':unique_id', $uniqueID);

            if ($stmt->execute()) {
                http_response_code(201);
                return ["message" => "User registered successfully", "unique_id" => $uniqueID];
            } else {
                http_response_code(500);
                return ["error" => "Execution failed"];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ["error" => "Query failed"];
        }
    }

    public function saveProfile($data) {
        global $conn;
        $uniqueID = $data['uniqueID'];
        $aboutMe = $data['aboutMe'];
        $age = $data['age'];
        $residence = $data['residence'];
        $address = $data['address'];
        $email = $data['email'];
        $phone = $data['phone'];

        try {
            $sql = "SELECT * FROM users WHERE uniqueID = :uniqueID";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':uniqueID', $uniqueID);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result) {
                $sql = "UPDATE users SET aboutMe = :aboutMe, age = :age, residence = :residence, address = :address, email = :email, phone = :phone WHERE uniqueID = :uniqueID";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(':aboutMe', $aboutMe);
                $stmt->bindParam(':age', $age);
                $stmt->bindParam(':residence', $residence);
                $stmt->bindParam(':address', $address);
                $stmt->bindParam(':email', $email);
                $stmt->bindParam(':phone', $phone);
                $stmt->bindParam(':uniqueID', $uniqueID);
            } else {
                $sql = "INSERT INTO users (uniqueID, aboutMe, age, residence, address, email, phone) VALUES (:uniqueID, :aboutMe, :age, :residence, :address, :email, :phone)";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(':uniqueID', $uniqueID);
                $stmt->bindParam(':aboutMe', $aboutMe);
                $stmt->bindParam(':age', $age);
                $stmt->bindParam(':residence', $residence);
                $stmt->bindParam(':address', $address);
                $stmt->bindParam(':email', $email);
                $stmt->bindParam(':phone', $phone);
            }

            if ($stmt->execute()) {
                return ["message" => "Profile saved successfully"];
            } else {
                return ["error" => "Error saving profile"];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ["error" => "Database error: " . $e->getMessage()];
        }
    }

    public function upload_image_with_id() {
        global $conn;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK && isset($_POST['unique_id'])) {
            $fileTmpPath = $_FILES['image']['tmp_name'];
            $fileName = $_FILES['image']['name'];
            $fileSize = $_FILES['image']['size'];
            $fileType = $_FILES['image']['type'];
            $fileNameCmps = explode(".", $fileName);
            $fileExtension = strtolower(end($fileNameCmps));

            $allowedfileExtensions = array('jpg', 'gif', 'png', 'jpeg');
            if (in_array($fileExtension, $allowedfileExtensions)) {
                $uploadFileDir = '../uploads/';
                $dest_path = $uploadFileDir . $fileName;

                if (move_uploaded_file($fileTmpPath, $dest_path)) {
                    $absoluteUrl = 'http://localhost/uploads/' . $fileName;
                    $uniqueID = $_POST['unique_id'];

                    $sql = "INSERT INTO images (url, alt, unique_id) VALUES (:url, :alt, :unique_id)";
                    $stmt = $conn->prepare($sql);
                    $stmt->execute(['url' => $absoluteUrl, 'alt' => $fileName, 'unique_id' => $uniqueID]);

                    return ["message" => "File is successfully uploaded."];
                } else {
                    http_response_code(500);
                    return ["error" => "There was an error moving the uploaded file."];
                }
            } else {
                http_response_code(400);
                return ["error" => "Upload failed. Allowed file types: " . implode(',', $allowedfileExtensions)];
            }
        } else {
            http_response_code(400);
            return ["error" => "Image file and unique ID are required."];
        }
    }




    public function delete_image($data) {
        global $conn;
        $imageId = $data['id'];

        try {
            $sql = "SELECT url FROM images WHERE id = :id";
            $stmt = $conn->prepare($sql);
            $stmt->execute(['id' => $imageId]);
            $image = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($image) {
                $imagePath = parse_url($image['url'], PHP_URL_PATH);
                $fullImagePath = $_SERVER['DOCUMENT_ROOT'] . $imagePath;
                if (file_exists($fullImagePath)) {
                    if (unlink($fullImagePath)) {
                        $sql = "DELETE FROM images WHERE id = :id";
                        $stmt = $conn->prepare($sql);
                        $stmt->execute(['id' => $imageId]);

                        if ($stmt->rowCount() > 0) {
                            return ["message" => "Image deleted successfully"];
                        } else {
                            http_response_code(404);
                            return ["error" => "Image not found in database"];
                        }
                    } else {
                        http_response_code(500);
                        return ["error" => "Failed to delete image file"];
                    }
                } else {
                    http_response_code(404);
                    return ["error" => "Image file not found"];
                }
            } else {
                http_response_code(404);
                return ["error" => "Image not found in database"];
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return ["error" => "Query failed"];
        }
    }

    public function upload_image() {
        global $conn;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['image']['tmp_name'];
            $fileName = $_FILES['image']['name'];
            $fileSize = $_FILES['image']['size'];
            $fileType = $_FILES['image']['type'];
            $fileNameCmps = explode(".", $fileName);
            $fileExtension = strtolower(end($fileNameCmps));

            $allowedfileExtensions = array('jpg', 'gif', 'png', 'jpeg');
            if (in_array($fileExtension, $allowedfileExtensions)) {
                $uploadFileDir = '../uploads/';
                $dest_path = $uploadFileDir . $fileName;

                if (move_uploaded_file($fileTmpPath, $dest_path)) {
                    $absoluteUrl = 'http://localhost/uploads/' . $fileName;
                    $sql = "INSERT INTO images (url, alt) VALUES (:url, :alt)";
                    $stmt = $conn->prepare($sql);
                    $stmt->execute(['url' => $absoluteUrl, 'alt' => $fileName]);

                    return ["message" => "File is successfully uploaded."];
                } else {
                    http_response_code(500);
                    return ["error" => "There was an error moving the uploaded file."];
                }
            } else {
                http_response_code(400);
                return ["error" => "Upload failed. Allowed file types: " . implode(',', $allowedfileExtensions)];
            }
        } else {
            http_response_code(400);
            return ["error" => "There was an error uploading the file."];
        }
    }
}
?>