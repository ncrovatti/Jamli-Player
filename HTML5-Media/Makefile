SHELL		= /bin/sh
export LANG = C

PREFIX		= `pwd`

COMPILE		= ${PREFIX}/build/compile.py
MINIFY		= ${PREFIX}/build/minify.py
UPLOAD		= ${PREFIX}/build/google_upload.py


RMFLAGS		= -rfv
MKDIRLAGS	= -vp
CPLAGS		= -v

SRC_DIR		= ${PREFIX}/js
RELEASE_DIR	= ${PREFIX}/release
DIST_DIR	= ${PREFIX}/dist


BASE_FILES	= ${SRC_DIR}/selfdom.js \
				${SRC_DIR}/jamli.js 

MODULES		= ${SRC_DIR}/top.js \
				${BASE_FILES} \
				${SRC_DIR}/bottom.js

THIS_YEAR	= `date +%Y`
D_VER		= `cat version`
VER			= sed s/@VERSION/${D_VER}/
YEAR		= sed s/@YEAR/${THIS_YEAR}/

DATE		= `export LANG=C; svn info . | grep Date: | sed 's/.*: //g'`
D_REV		= `export LANG=C; svn info . | grep Revision: | sed 's/.*: //g'`
REV			= sed s/@REVISION/${D_REV}/

J			= $(DIST_DIR)/jamli-$(D_VER).js
J_MIN		= $(DIST_DIR)/jamli-$(D_VER).min.js
J_COMP		= $(DIST_DIR)/jamli-$(D_VER).comp.js

all: dependencies jamli | minify compile
	@@echo "☛ Jamli Player v${D_VER} build complete."
	@@echo

dependencies: directories
	@@echo "⚙ Fetching external dependency."
	@@wget -qO $(SRC_DIR)/dsign.js "http://dsign.googlecode.com/svn/trunk/src/dsign.js"
	@@cat ${SRC_DIR}/selfdom-declaration.js >> ${SRC_DIR}/dsign.js
	@@cat ${SRC_DIR}/dsign.js | grep -v window.dSign > ${SRC_DIR}/selfdom.js
	@@echo "↳ External dependency met."
      
jamli: 
	@@echo "⚙ Building Jamli main file ..."
	
	@@cat ${MODULES} | sed 's/@DATE/Date: '"${DATE}"'/' | \
			sed 's/\/\*jslint.*$$//' | \
			sed 's/\/\*global.*$$//' | \
			${YEAR} | ${VER} > ${J}
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
	
	