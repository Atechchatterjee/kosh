import { ListDir } from "@/../wailsjs/go/backend/App";

export async function fetchFileList(specifiedFilePath: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    ListDir(specifiedFilePath, {
      IncludeDotfiles: false,
      Sort: true,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => reject(err));
  });
}
