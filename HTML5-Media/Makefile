SHELL		= /bin/sh
export LANG = C

PREFIX		= `pwd`

COMPILE		= ${PREFIX}/build/compile.py
MINIFY		= ${PREFIX}/build/minify.py
UPLOAD		= ${PREFIX}/build/google_upload.py


RMFLAGS		= -rfv
MKDIRLAGS	= -vp
CPFLAGS		= -v

SRC_DIR		= ${PREFIX}/js
BIN_DIR		= ${PREFIX}/bin
CSS_DIR		= ${PREFIX}/css
RELEASE_DIR	= ${PREFIX}/release
DIST_DIR	= ${PREFIX}/dist

HEADER		= ${SRC_DIR}/top.js
 
BASE_FILES	= ${SRC_DIR}/selfdom.js \
				${SRC_DIR}/jamli.js 

INDEX		= index.html

THIS_YEAR	= `date +%Y`
D_VER		= `cat version`
VER			= sed s/@VERSION/$(D_VER)/
YEAR		= sed s/@YEAR/${THIS_YEAR}/


DATE		= `export LANG=C; svn info . | grep Date: | sed 's/.*: //g'`
D_REV		= `export LANG=C; svn info . | grep Revision: | sed 's/.*: //g'`
REV			= sed s/@REVISION/${D_REV}/


J			= $(DIST_DIR)/jamli-$(D_VER).js
J_LATEST	= $(DIST_DIR)/jamli-latest.js
J_MIN		= $(DIST_DIR)/jamli-$(D_VER).min.js
J_COMP		= $(DIST_DIR)/jamli-$(D_VER).comp.js

ARCHIVE		= jamli-$(D_VER).tar.gz

FILTER_SIZE	= sed 's/\(.*\)\s*total/\1/' | \
				tail -n 1 | tr -d "\n\t" | \
				tr "[A-Z]" "[a-z]"


all: dependencies jamli | minify compile
	@@echo "☛ Jamli Player v${D_VER} build complete."
	@@echo

dependencies: directories
	@@echo "⚙ Fetching external dependency."
	@@wget --no-cache -qO $(SRC_DIR)/dsign.js "http://dsign.googlecode.com/svn/trunk/src/dsign.js"
	@@cat ${SRC_DIR}/selfdom-declaration.js >> ${SRC_DIR}/dsign.js
	@@cat ${SRC_DIR}/dsign.js | grep -v window.dSign > ${SRC_DIR}/selfdom.js
	@@echo "↳ External dependency met."

jamli: dependencies
	@@echo "⚙ Building Jamli main file ..."
	@@cat $(HEADER) | ${YEAR} | ${VER} | \
			sed 's/\/\*jslint.*$$//' | \
			sed 's/\/\*global.*$$//' > $(J)
	@@echo "(function (window, undefined) {" >> $(J)
	@@cat $(BASE_FILES) | sed 's/@DATE/Date: '"${DATE}"'/' >> $(J)
	@@echo "})(window);" >> $(J)
	@@cp $(CPFLAGS) $(J) $(J_LATEST)
	@@echo "↳ Jamli is ready for further operations."
	
clean: 
	@@echo "⚙ Cleaning ..."
	@@rm $(RMFLAGS) $(SRC_DIR)/dsign.js $(SRC_DIR)/selfdom.js
	@@rm $(RMFLAGS) ${DIST_DIR} ${RELEASE_DIR}
	@@echo "↳ Clean as a baby."
	@@echo
	
directories:
	@@echo "⚙ Creating directories ..."
	@@mkdir $(MKDIRLAGS) ${DIST_DIR}
	@@mkdir $(MKDIRLAGS) ${RELEASE_DIR}
	@@mkdir $(MKDIRLAGS) ${RELEASE_DIR}/bin
	@@mkdir $(MKDIRLAGS) ${RELEASE_DIR}/css
	@@echo "↳ All directories created."


minify: 
	@@echo "⚙ Minifying using Douglas Crockford JSMin"
	@@head -12 $(J) > $(J_MIN)
	@@cat $(J) | python $(MINIFY) >> $(J_MIN)
	@@echo "↳ $(J_MIN) Built"

compile: 
	@@echo "⚙ Compressing using Google Closure Compiler"
	@@head -12 $(J) > $(J_COMP)
	@@python $(COMPILE) $(J) >> $(J_COMP)
	@@echo "↳ $(J_COMP) Built"
	
readme:
	@@cat $(SRC_DIR)/README | sed 's/@DATE/Date: '"${DATE}"'/' | \
			${VER} | ${YEAR} > $(RELEASE_DIR)/README
			
index: jamli archive
	@@echo "⚙ Creating index.html"
	@@cat $(PREFIX)/$(INDEX) | $(VER) | \
		sed 's/@archive_target/'"$(ARCHIVE)"'/' | \
		sed 's/@archive_size/'"$(shell du --apparent-size -hc $(DIST_DIR)/$(ARCHIVE) | ${FILTER_SIZE})"'/' > $(DIST_DIR)/$(INDEX)
	@@echo "↳ $(DIST_DIR)/$(INDEX) created."
			
archive: jamli | minify compile readme
	@@echo "⚙ Creating tarball"
	@@cp $(CPFLAGS) $(SRC_DIR)/LICENSE $(RELEASE_DIR)/
	@@cp $(CPFLAGS) $(DIST_DIR)/* $(RELEASE_DIR)/
	@@cp $(CPFLAGS) $(BIN_DIR)/* $(RELEASE_DIR)/bin
	@@cp $(CPFLAGS) $(CSS_DIR)/jamli.css $(RELEASE_DIR)/css
	@@tar --create --file=$(DIST_DIR)/$(ARCHIVE) -C $(RELEASE_DIR) .
	@@echo "↳ $(DIST_DIR)/$(ARCHIVE) created."

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	