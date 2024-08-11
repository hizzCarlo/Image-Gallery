<?php
   header('Access-Control-Allow-Origin: *');
   header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE');
   header('Access-Control-Allow-Headers: Content-Type, Authorization');
   header('Content-Type: application/json');

   if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
       http_response_code(200);
       exit();
   }

   require_once 'config.php';
   require_once 'modules/get.php';
   require_once 'modules/post.php';

   $get = new Get();
   $post = new Post();

   if (isset($_REQUEST['request'])) {
       $request = explode('/', $_REQUEST['request']);
   } else {
       echo "Not Found";
       http_response_code(404);
       exit();
   }

   switch ($_SERVER['REQUEST_METHOD']) {
       case 'GET':
           switch ($request[0]) {
               case 'get-images':
                   echo json_encode($get->get_images());
                   break;
               case 'get-images-by-id':
                   echo json_encode($get->get_images_by_id($request[1]));
                   break;
               case 'download-image':
                   if (isset($_GET['id'])) {
                       $get->download_image($_GET['id']);
                   } else {
                       echo json_encode(["error" => "Image ID is required."]);
                       http_response_code(400);
                   }
                   break;
               case 'fetch-image':
                   $get->fetch_image($_GET['url']);
                   break;
               case 'fetch_profile':
                   echo json_encode($get->fetch_profile($request[1]));
                   break;
               case 'get_unique_id':
                   if (isset($_GET['username'])) {
                       echo json_encode($get->get_unique_id($_GET['username']));
                   } else {
                       echo json_encode(["error" => "Username parameter is missing"]);
                       http_response_code(400);
                   }
                   break;
               default:
                   echo "This is forbidden";
                   http_response_code(403);
                   break;
           }
           break;
       case 'POST':
           $data = json_decode(file_get_contents("php://input"), true);
           switch ($request[0]) {
               case 'login':
                   echo json_encode($post->login($data));
                   break;
               case 'register':
                   echo json_encode($post->register($data));
                   break;
               case 'saveProfile':
                   echo json_encode($post->saveProfile($data));
                   break;
               case 'upload-image':
                   echo json_encode($post->upload_image());
                   break;
               case 'upload-image-with-id':
                   if (isset($_FILES['image']) && isset($_POST['unique_id'])) {
                       echo json_encode($post->upload_image_with_id());
                   } else {
                       echo json_encode(["error" => "Image file and unique ID are required."]);
                       http_response_code(400);
                   }
                   break;
               default:
                   echo "This is forbidden";
                   http_response_code(403);
                   break;
           }
           break;
       case 'DELETE':
           $data = json_decode(file_get_contents("php://input"), true);
           switch ($request[0]) {
               case 'delete-image':
                   echo json_encode($post->delete_image($data));
                   break;
               default:
                   echo "This is forbidden";
                   http_response_code(403);
                   break;
           }
           break;
       default:
           echo "Method not available";
           http_response_code(404);
           break;
   }
   ?>