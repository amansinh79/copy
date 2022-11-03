import fs from "fs"
import path from "path"
export default function readyFiles(fileList) {
  const files = []
  fileList = fileList.map((file) => ({ name: file, isDir: fs.statSync(file).isDirectory() }))
  fileList.forEach((file) => {
    if (file.isDir) {
      const f = getFiles(file.name)
      files.push(...f)
    } else {
      files.push({ file: file.name, dirname: path.dirname(file.name) })
    }
  })

  return files
}

function getFiles(dir) {
  const files = getFilesHelper(dir)
  return files
}

function getFilesHelper(dir) {
  return fs.readdirSync(dir).flatMap((item) => {
    const p = `${dir}${path.sep}${item}`
    if (fs.statSync(p).isDirectory()) {
      return getFilesHelper(p)
    }
    return p
  })
}
