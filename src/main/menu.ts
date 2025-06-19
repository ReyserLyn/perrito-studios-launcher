import { app, Menu, MenuItemConstructorOptions } from 'electron'

export function createMenu(): void {
  if (process.platform === 'darwin') {
    // Menu para macOS
    const applicationSubMenu: MenuItemConstructorOptions = {
      label: 'Application',
      submenu: [
        {
          label: 'Acerca de Perrito Studios Launcher',
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: 'Salir',
          accelerator: 'Command+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    }

    // Menu de edición para soporte de atajos de teclado
    const editSubMenu: MenuItemConstructorOptions = {
      label: 'Editar',
      submenu: [
        {
          label: 'Deshacer',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: 'Rehacer',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cortar',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copiar',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Pegar',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'Seleccionar Todo',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll'
        }
      ]
    }

    const menuTemplate: MenuItemConstructorOptions[] = [applicationSubMenu, editSubMenu]
    const menuObject = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menuObject)
  }
}
