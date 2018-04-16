## TEST
REPORTER = tap
TEST_FILES = test/*.test.js

## DOCS
TMPL_DIR = docs-tmpl
MOCHA_MD_DOCS = README_footer.md

## Build
MOD_NAME = isfunction
BUILD_DIR = build
BUILD_STANDALONE = $(BUILD_DIR)/$(MOD_NAME).js
BUILD_STANDALONE_MIN = $(BUILD_STANDALONE:.js=.min.js)
COMPONENTJS_CMD = @component build --out $(@D) --name $(basename $(@F))


######################################
# Release
######################################
publish: clean build docs test-node lint

docs: build
	@grunt build
	@make clean-readme

lint:
	@./node_modules/.bin/jshint lib

######################################
# Node Tests
######################################
# test: test-node test-saucelabs
test: test-node

test-node: npm-install-dev
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--timeout 2000 \
		$(TEST_FILES)

test-saucelabs: npm-install-dev components
	@grunt test

server test-browser: npm-install-dev components
	@serve
	@echo go to http://localhost:3000/test

npm-install-dev: package.json
	@npm install

######################################
# Build
######################################
build: components npm-install-dev $(BUILD_STANDALONE_MIN)

$(BUILD_STANDALONE_MIN): $(BUILD_STANDALONE)
	@./node_modules/.bin/uglifyjs < $^ > $@

$(BUILD_STANDALONE):
	$(COMPONENTJS_CMD) --standalone $(MOD_NAME)

components: component.json
	@component install --dev

######################################
# Docs
# run grunt readme
######################################
readme: readme-footer
	@grunt readme-concat

readme-footer:
	@[ -d $(TMPL_DIR) ] || mkdir $(TMPL_DIR)
	@make test-node REPORTER=markdown \
		| tail -n +2 \
		| head -n -2 \
		| sed 's/\# /\#\#\# /g' \
		| sed 's/TOC/API/g' \
		| sed 's/^isFunction\./#\#\#\#\# isFunction\./g' \
		| cat > $(TMPL_DIR)/$(MOCHA_MD_DOCS)
	@echo '' >> $(TMPL_DIR)/$(MOCHA_MD_DOCS)
	@echo '## License' >> $(TMPL_DIR)/$(MOCHA_MD_DOCS)


######################################
# Housekeeping
######################################
size: build
	@echo "$(BUILD_STANDALONE): `wc -c $(BUILD_STANDALONE) | sed 's/ .*//'`"
	@echo "$(BUILD_STANDALONE_MIN): `gzip -c $(BUILD_STANDALONE_MIN) | wc -c`"

clean: clean-readme
	@rm -f *.log*
	@rm -rf build components $(COMPONENTJS_PRIVATE_MODS)

clean-readme:
	@find $(TMPL_DIR) -maxdepth 1 -type f ! -iname '*.tmpl' -delete

.PHONY: readme clean npm-install-dev release test test-* size server