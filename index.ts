import { JumpFm } from 'jumpfm-api'

import * as archiver from 'archiver';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as replaceExt from 'replace-ext';
import * as extractor from 'unzip';

export const load = (jumpFm: JumpFm) => {
    const bind = jumpFm.bind
    const activePanel = jumpFm.getPanelActive

    const unzip = () => {
        try {
            const zipFile = activePanel().getCurrentItem()
            const fullPath = zipFile.path
            fs.createReadStream(fullPath)
                .pipe(extractor.Extract({
                    path: replaceExt(fullPath, '')
                }));
        } catch (e) {
            console.log(e)
        }
    }

    const zip = () => {
        const zip = archiver('zip', { zlib: { level: 1 } })
        const pan = activePanel()
        pan.getSelectedItems().forEach(item => {
            const stat = fs.statSync(item.path)
            if (stat.isDirectory())
                zip.directory(item.path, item.name)
            else
                zip.append(item.path, { name: item.name })
        })

        jumpFm.dialog.open({
            label: 'Zip To',
            onOpen: input => {
                input.value = 'untitled.zip'
                input.select()
                input.setSelectionRange(0, 'untitled'.length)
            },
            onAccept: to => {
                const out = fs.createWriteStream(path.join(pan.getUrl().path, to))
                zip.pipe(out)
                zip.finalize()
            }
        })
    }

    bind('zip', ['z'], zip)
    bind('unzip', ['u'], unzip)
}