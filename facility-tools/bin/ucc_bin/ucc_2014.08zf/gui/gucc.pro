#webkit is used in Qt4 for QWebView
QT		+= core gui webkit
TEMPLATE	= app
LANGUAGE	= C++

#webkitwidgets is used in Qt5 for QWebView
CONFIG	+= qt warn_on debug_and_release
greaterThan(QT_MAJOR_VERSION, 4): QT += widgets webkitwidgets

DEFINES	+= QTGUI

HEADERS += \
	GAsciiDialog.h \
	GExtensionDialog.h \
	GMainWindow.h \
	GSideBySideDialog.h \
	GTableDialog.h \
	GUtil.h\
	../src/CAdaCounter.h \
	../src/CBashCounter.h \
	../src/CBatchCounter.h \
	../src/cc_main.h \
	../src/CCCounter.h \
	../src/CCFScriptCounter.h \
	../src/CCJavaCsCounter.h \
	../src/CCodeCounter.h \
	../src/CColdFusionCounter.h \
	../src/CCsharpCounter.h \
	../src/CCshCounter.h \
	../src/CCssCounter.h \
	../src/CDataCounter.h \
	../src/CFortranCounter.h \
	../src/CHtmlCounter.h \
	../src/CJavaCounter.h \
	../src/CJavascriptCounter.h \
	../src/CMakefileCounter.h \
	../src/CMatlabCounter.h \
	../src/CMidasCounter.h \
	../src/CmpMngr.h \
	../src/CNeXtMidasCounter.h \
	../src/CPascalCounter.h \
	../src/CPerlCounter.h \
	../src/CPhpCounter.h \
	../src/CPythonCounter.h \
	../src/CRubyCounter.h \
	../src/CSqlCounter.h \
	../src/CTagCounter.h \
	../src/CUtil.h \
	../src/CVbCounter.h \
	../src/CVbscriptCounter.h \
	../src/CVerilogCounter.h \
	../src/CVHDLCounter.h \
	../src/CWebCounter.h \
	../src/CXMidasCounter.h \
	../src/CXMLCounter.h \
	../src/DiffTool.h \
	../src/MainObject.h \
	../src/UserIF.h \
	../src/CmpMngrHtml.h

SOURCES += \
	GAsciiDialog.cpp \
	GExtensionDialog.cpp \
	GMainWindow.cpp \
	GSideBySideDialog.cpp \
	GTableDialog.cpp \
	GUtil.cpp\
	main.cpp \
	../src/CAdaCounter.cpp \
	../src/CBashCounter.cpp \
	../src/CBatchCounter.cpp \
	../src/cc_main.cpp \
	../src/CCCounter.cpp \
	../src/CCFScriptCounter.cpp \
	../src/CCJavaCsCounter.cpp \
	../src/CCodeCounter.cpp \
	../src/CColdFusionCounter.cpp \
	../src/CCsharpCounter.cpp \
	../src/CCshCounter.cpp \
	../src/CCssCounter.cpp \
	../src/CDataCounter.cpp \
	../src/CFortranCounter.cpp \
	../src/CHtmlCounter.cpp \
	../src/CJavaCounter.cpp \
	../src/CJavascriptCounter.cpp \
	../src/CMakefileCounter.cpp \
	../src/CMatlabCounter.cpp \
	../src/CMidasCounter.cpp \
	../src/CmpMngr.cpp \
	../src/CNeXtMidasCounter.cpp \
	../src/CPascalCounter.cpp \
	../src/CPerlCounter.cpp \
	../src/CPhpCounter.cpp \
	../src/CPythonCounter.cpp \
	../src/CRubyCounter.cpp \
	../src/CSqlCounter.cpp \
	../src/CTagCounter.cpp \
	../src/CUtil.cpp \
	../src/CVbCounter.cpp \
	../src/CVbscriptCounter.cpp \
	../src/CVerilogCounter.cpp \
	../src/CVHDLCounter.cpp \
	../src/CWebCounter.cpp \
	../src/CXMidasCounter.cpp \
	../src/CXMLCounter.cpp \
	../src/DiffTool.cpp \
	../src/MainObject.cpp \
	../src/UserIF.cpp \
	../src/CmpMngrHtml.cpp

FORMS += \
	GAsciiDialog.ui \
	GExtensionDialog.ui \
	GMainWindow.ui \
	GTableDialog.ui \
	GSideBySideDialog.ui

RESOURCES += \
	gucc.qrc

win32 {
	TARGET = GUCC
	UI_DIR = GeneratedFiles
	RCC_DIR = GeneratedFiles
	RC_FILE = GUCC.rc
	# uncomment for MinGW
	# DEFINES += MINGW
}
unix {
	UI_DIR = .ui
	MOC_DIR = .moc
	OBJECTS_DIR = .obj
	DEFINES += UNIX
}
macx {
	TARGET = GUCC
	RC_FILE = images/gucc.icns
	DEFINES += UNIX
}
