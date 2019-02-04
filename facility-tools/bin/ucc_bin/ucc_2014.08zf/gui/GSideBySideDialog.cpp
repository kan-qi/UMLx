//! GSideBySideDialog class methods.
/*!
* \file GSideBySideDialog.cpp
*
* This file contains the GSideBySideDialog class methods.
*/

#include "GSideBySideDialog.h"
#include "ui_GSideBySideDialog.h"


//QWebView use different structure in Qt4 and Qt5. Backward/forward compatible handling
#if (QT_VERSION < 0x050000)
#include <QWebView>
#else
#include <QtWebKitWidgets/QWebView>
#endif



/*!
* Constructs a GSideBySideDialog object.
*
* \param filePathA souce A file or directory
* \param filePathB souce B file or directory
* \param parent parent widget
*/
GSideBySideDialog::GSideBySideDialog(const QString &filePathA, const QString &filePathB, const QString &htmlPath, QWidget *parent) :
    QDialog(parent),
    ui(new Ui::GSideBySideDialog)
{

    
    QString filename = htmlPath + "/" + HTML_FILE;

    ui->setupUi(this);
    setLayout(ui->verticalLayout);
    
	if (!filePathA.isEmpty())
	{
		ui->lineEdit->setText(filePathA);
		ui->lineEdit->setEnabled(true);		
	}	    
    
	if (!filePathB.isEmpty())
	{
		ui->lineEdit_2->setText(filePathB);
		ui->lineEdit_2->setEnabled(true);		
	}    
    ui->webView->load(QUrl::fromLocalFile(filename));


}

GSideBySideDialog::~GSideBySideDialog()
{
    delete ui;
}
