package file

import (
	"fmt"
	"io/fs"
	"kosh/backend/types"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// sorts the file structs keeping the order - directories followed by regular files or visa-versa
func SortFileStructByDir(fileStructs []types.FileStruct) []types.FileStruct {
	var directories, regularFiles []types.FileStruct

	for _, fileStruct := range fileStructs {
		if fileStruct.IsDir {
			directories = append(directories, fileStruct)
		} else {
			regularFiles = append(regularFiles, fileStruct)
		}
	}

	return append(directories, regularFiles...)
}

func RemoveDotfiles(fileStructs []types.FileStruct) []types.FileStruct {
	var fileStructsWithoutDotfiles []types.FileStruct

	for _, fileStruct := range fileStructs {
		if fileStruct.FileName[0] != '.' {
			fileStructsWithoutDotfiles = append(fileStructsWithoutDotfiles, fileStruct)
		}
	}

	return fileStructsWithoutDotfiles
}

func ReadDirWithPermissionCheck(path string) ([]fs.DirEntry, error) {
	// Get absolute path
	absPath, err := filepath.Abs(path)
	if err != nil {
		return nil, fmt.Errorf("error getting absolute path: %v", err)
	}

	// Check if the path exists
	_, err = os.Stat(absPath)
	if os.IsNotExist(err) {
		return nil, fmt.Errorf("path does not exist: %s", absPath)
	}

	// Check read permission
	files, err := os.ReadDir(absPath)
	if err != nil {
		fmt.Print(err)
		return nil, fmt.Errorf("no read permission for %s: %v", absPath, err)
	}

	return files, nil
}

func GetFileType(filePath string) (string, error) {
	out, err := exec.Command("xdg-mime", "query", "filetype", filePath).Output()
	if err != nil {
		return "", err
	}

	return strings.TrimSpace(string(out)), nil
}

func GetAssociatedProgram(filePath string) (string, error) {
	out, err := exec.Command("xdg-mime", "query", "default", filePath).Output()
	if err != nil {
		return "", err
	}

	return strings.TrimSpace(string(out)), nil
}
