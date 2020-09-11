//! GMainWindow class definitions.
/*!
* \file GMainWindow.h
*
* This file contains the GMainWindow class definition.
*/

#ifndef GMAINWINDOW_H
#define GMAINWINDOW_H

#include <QList>
#include <QListWidgetItem>
#include <QMainWindow>
#include <QMap>
#include <QModelIndexList>
#include <QProgressBar>
#include "GAsciiDialog.h"
#include "GExtensionDialog.h"
#include "GTableDialog.h"
#include "ui_GMainWindow.h"
//wei
#include "GSideBySideDialog.h"

#define FILE_LIST_A "fileListA.txt"
#define FILE_LIST_B "fileListB.txt"

//! Main window.
/*!
* \class GMainWindow
*
* Defines a main window.
*/
class GMainWindow : public QMainWindow
{
    Q_OBJECT

public:
    GMainWindow(QWidget *parent = 0, Qt::WindowFlags f = 0);
    ~GMainWindow();

signals:
	void canceledExecution();

public slots:
	void updateLog(const QString &err);
	void updateProgress(const QString &msg, int pct);

private slots:
	void on_btnStart_clicked();
	void on_btnStop_clicked();
    void on_actionOpen_File_triggered();
	void on_actionEdit_Extensions_triggered();
	void on_actionExit_triggered();
    void on_actionUser_Manual_triggered();
	void on_actionRelease_Notes_triggered();
	void on_actionLicense_triggered();
	void on_actionAbout_triggered();
	void on_btnAddFileA_clicked();
	void on_btnAddFileB_clicked();
	void on_btnRemoveFileA_clicked();
	void on_btnRemoveFileB_clicked();
	void on_btnAddFolderA_clicked();
	void on_btnAddFolderB_clicked();
	void listACustomContextMenuRequested(const QPoint &pos);
	void listBCustomContextMenuRequested(const QPoint &pos);
	void removeAllFilesA();
	void removeAllFilesB();
	void on_btnClearSelExt_clicked();
	void on_chkDifferencing_clicked();
	void on_chkModThreshold_clicked();
	void on_chkDupThreshold_clicked();
	void on_chkTruncThreshold_clicked();
	void on_btnBrowseOutputDir_clicked();
	void on_chkExtensionFile_clicked();
	void on_btnBrowseExtensionFile_clicked();
	QStringList getFilters();

private:
	Ui::GMainWindowClass ui;

	GExtensionDialog *extensionDialog;
	GAsciiDialog *mAsciiDialog;
	GTableDialog *mTableDialog;
	QButtonGroup bgrpOutputFormat;
	QProgressBar *progressBar;
	//Qwebviewer
    GSideBySideDialog *mSideBySideDialog;

	QMap<QString, QStringList *> extensionMapDefault;	//!< Map of default language extensions
	QMap<QString, QStringList *> extensionMapCustom;	//!< Map of custom language extensions
	bool customChanged;									//!< Flag indicating that custom extensions have changed
	bool defaultDirSet;									//!< Flag indicating that a file browser has been opened
	bool execCanceled;									//!< Flag indicating canceled execution

	void executionRunning(bool enabled);
	void getDefaultExtensions();
	void extensionsUpdated();
	bool parseExtensionsFile();
	bool writeExtensionsFile();
	bool parsePreferencesFile();
	bool writePreferencesFile();
};

#endif // GMAINWINDOW_H
