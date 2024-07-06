package main

import (
	"context"
	"fmt"
	"io/fs"
	"os"
	"os/user"
	"path/filepath"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
}

// domReady is called after front-end resources have been loaded
func (a App) domReady(ctx context.Context) {
	// Add your action here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Perform your teardown here
}

type FileStruct struct {
	FileName string
	IsDir    bool
}

// sorts the file structs keeping the order - directories followed by regular files or visa-versa
func sortFileStructByDir(fileStructs []FileStruct) []FileStruct {
	var directories, regularFiles []FileStruct

	for _, fileStruct := range fileStructs {
		if fileStruct.IsDir {
			directories = append(directories, fileStruct)
		} else {
			regularFiles = append(regularFiles, fileStruct)
		}
	}

	return append(directories, regularFiles...)
}

func removeDotfiles(fileStructs []FileStruct) []FileStruct {
	var fileStructsWithoutDotfiles []FileStruct

	for _, fileStruct := range fileStructs {
		if fileStruct.FileName[0] != '.' {
			fileStructsWithoutDotfiles = append(fileStructsWithoutDotfiles, fileStruct)
		}
	}

	return fileStructsWithoutDotfiles
}

type AdditionalParams struct {
	IncludeDotfiles bool
	Sort            bool
}

func readDirWithPermissionCheck(path string) ([]fs.DirEntry, error) {
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
		fmt.Print("Error getting files")
		fmt.Print(err)
		return nil, fmt.Errorf("no read permission for %s: %v", absPath, err)
	}

	return files, nil
}

func CheckPermission(path string) error {
	_, err := readDirWithPermissionCheck(path)
	return err
}

func (a *App) ListDir(dirPath string, additionalParmas AdditionalParams) ([]FileStruct, error) {
	files, err := readDirWithPermissionCheck(dirPath)
	if err != nil {
		fmt.Println("no permissions :(")
		fmt.Print(err)
		return []FileStruct{}, err
	}

	// files, err := os.ReadDir(dirPath)
	if err != nil {
		fmt.Print("Error getting files")
		fmt.Print(err)
	}

	var fileStruct []FileStruct

	currentUser, err := user.Current()
	if err != nil {
		fmt.Println("can not get current user")
		fmt.Print(err)
	}
	fmt.Println(currentUser.Name)
	for _, file := range files {
		// filePermissions, err := file.Info()
		// if err != nil {
		// 	fmt.Println(err)
		// }
		// for i := 0; i < 10; i++ {
		// 	fmt.Print(string(filePermissions.Mode().String()[i]))
		// }
		// fmt.Println()
		fileInfoStuct := FileStruct{
			FileName: file.Name(),
			IsDir:    file.IsDir(),
		}
		fileStruct = append(fileStruct, fileInfoStuct)
	}

	if additionalParmas.Sort {
		fileStruct = sortFileStructByDir(fileStruct)
	}

	if !additionalParmas.IncludeDotfiles {
		fileStruct = removeDotfiles(fileStruct)
	}

	return fileStruct, err
}

func (a *App) GetUserHomeDir() (string, error) {
	dirname, err := os.UserHomeDir()
	if err != nil {
		fmt.Println("Failed to get the home dir")
		fmt.Print(err)
	}
	return dirname, err
}
