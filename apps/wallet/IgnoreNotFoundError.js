const ModuleDependencyWarning = require("webpack/lib/ModuleDependencyWarning.js")

module.exports = class IgnoreNotFoundExportPlugin {
    apply(compiler) {
        const messageRegExp = /export '.*'( \(reexported as '.*'\))? was not found in/
        function doneHook(stats) {
            stats.compilation.warnings = stats.compilation.warnings.filter(function(warn) {
                if (warn instanceof ModuleDependencyWarning && messageRegExp.test(warn.message)) {
                    return false
                }
                return true;
            })
        }
        if (compiler.hooks) {
            compiler.hooks.done.tap("IgnoreNotFoundExportPlugin", doneHook)
        } else {
            compiler.plugin("done", doneHook)
        }
    }
}
