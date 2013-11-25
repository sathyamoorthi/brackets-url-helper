/*
The MIT License (MIT)

Copyright (c) 2013 Sathyamoorthi <sathyamoorthi10@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, document*/

define(function (require, exports, module) {
    "use strict";
    
    var Menus                = brackets.getModule("command/Menus"),
        CommandManager       = brackets.getModule("command/CommandManager"),
        EditorManager        = brackets.getModule("editor/EditorManager"),
        NativeApp            = brackets.getModule("utils/NativeApp"),
        editorContextMenu    = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU),
        COMMAND_STRING       = "Go to link",
        command_id           = "urlhelper-gotolink",
        regex                = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
    
    /*
    Pass 'command id' and it'll let you know, whether contextmenu item for that command is existing or not.
    */
    function _isMenuThere(cmd) {
        return Menus.getMenuItem(editorContextMenu.id + "-" + cmd) ? true : false;
    }

    function _gotoUrl() {
       var editor = EditorManager.getActiveEditor(), urlString;

        if (editor) {
           urlString = editor._codeMirror.getSelection();

           if (urlString && urlString.match(regex)) {
                NativeApp.openURLInDefaultBrowser(urlString);
           }
        }
    }
    
    $(editorContextMenu).on("beforeContextMenuOpen", function (){
        
        var editor = EditorManager.getActiveEditor(), 
            cm, cursor, lineString, urls, urlString, protocalLength,
            removeMenuIfExists = true;
        
        if (editor) {
            cm = editor._codeMirror;
            cursor = cm.getCursor();
            lineString = cm.getLine(cursor.line);
            
            if (lineString.toLowerCase().indexOf("http") > -1) {
                removeMenuIfExists = false;
                protocalLength = cm.getSelection().length; 
                
                if (!_isMenuThere(command_id)) {
                    CommandManager.register(COMMAND_STRING, command_id, _gotoUrl);                    
                    editorContextMenu.addMenuItem(command_id);
                }
                
                lineString = lineString.substring(cursor.ch - protocalLength, lineString.length);
                urls = lineString.match(regex);
                
                if (urls && urls.length > 0) {
                    urlString = urls[0];
                    lineString = lineString.substr(0, urlString.length);
                    
                    if (lineString.length === urlString.length) {
                        cm.setSelection({line: cursor.line, ch: cursor.ch - protocalLength}, 
                                        {line: cursor.line, ch: (cursor.ch - protocalLength + urlString.length)});
                    }
                }
            }
        }        
        
        if (removeMenuIfExists && _isMenuThere(command_id)) {
            editorContextMenu.removeMenuItem(command_id);
        }
    });
});