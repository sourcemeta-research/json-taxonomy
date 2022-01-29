.PHONY: html clean test all
.DEFAULT_GOAL = all

OUTPUT ?= dist

MKDIRP ?= mkdir -p
INSTALL ?= install
NPM ?= npm
NODE ?= node
CAT ?= cat
MV ?= mv
RMRF ?= rm -rf
RM ?= rm

SRC_JS = js/analyze.js js/index.js js/json.js

node_modules: package.json package-lock.json
	exec $(NPM) ci

$(OUTPUT):
	exec $(MKDIRP) $@

$(OUTPUT)/index.html: www/index.html | $(OUTPUT)
	exec $(INSTALL) -m 0664 $< $@

$(OUTPUT)/style.min.css: \
	node_modules/uikit/dist/css/uikit-core.css \
	node_modules/codemirror/lib/codemirror.css \
	node_modules/codemirror/theme/idea.css \
	www/style.css \
	| node_modules $(OUTPUT)
	exec $(CAT) $^ | $(NODE) $(word 1,$|)/csso-cli/bin/csso > $@

$(OUTPUT)/app.min.js: www/app.js node_modules $(SRC_JS) | $(OUTPUT)
	exec $(NODE) $(word 2,$^)/webpack-cli/bin/cli.js --mode production --entry ./$< --output-path $(dir $@)
	exec $(RM) $(dir $@)/main.js.LICENSE.txt
	exec $(MV) $(dir $@)/main.js $@

html: $(OUTPUT)/index.html $(OUTPUT)/style.min.css $(OUTPUT)/app.min.js

clean:
	$(RMRF) $(OUTPUT)

lint: node_modules
	exec $(NODE) $</standard/bin/cmd.js

test: node_modules
	exec $(NODE) $</tap/bin/run.js --reporter=classic \
		--no-coverage --no-timeout 'test/**/*.test.js'

all: lint test html
