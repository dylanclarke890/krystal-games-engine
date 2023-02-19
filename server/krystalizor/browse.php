<?php

declare(strict_types=1);
require_once("../config.php");

$dir = $_GET["dir"];
$dir = $file_root . str_replace('..', '', $dir);
if ($dir[strlen($dir) - 1] !== '/') $dir .= '/';
$type = $_GET["type"];

$find;
switch ($_GET['type']) {
  case 'images':
    $find = '*.{png,gif,jpg,jpeg,svg}';
    break;
  case 'scripts':
    $find = '*.js';
    break;
  default:
    $find = '*.*';
    break;
}

function getFiles($dir, $find, $depth = 0, $maxDepth = 5)
{
  if ($depth > $maxDepth) return array();
  $files = glob($dir . $find, GLOB_BRACE) ?? array(); // Files in current directory
  $directories = glob($dir . "*", GLOB_ONLYDIR) ?? array(); // Get directories to loop through
  if (sizeof($directories) === 0) return $files;
  foreach ($directories as $i => $d) $files = array_merge(getFiles($d . "/", $find, $depth + 1), $files);
  return $files;
}

$files = getFiles($dir, $find);
foreach ($files as $i => $f) $files[$i] = substr($f, $file_root_len);
echo json_encode($files);
