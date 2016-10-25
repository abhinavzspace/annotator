/*
 * Listen for requests from the background scripts. Since the annotator code is
 * loaded in the page context, background events which interact with the
 * annotator user interface, such as showing or hiding the annotator need to be
 * handled here.
 */
chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        var command = request.annotator
        if (command) {
            if (command === 'load') {
                // $(document.body).annotator().annotator('setupPlugins')
                var elem = document.body;
                var app = new annotator.App()
                    .include(annotator.ui.main, {element: elem})
                    .include(annotator.ui.filter.standalone)
                    .include(annotator.storage.debug)
                    .start()
                sendResponse({ok: true})
            } else {
                sendResponse({error: new TypeError("not implemented: " + command)})
            }
        }
    }
)
