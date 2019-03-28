//! GSideBySideDialog class definitions.
/*!
* \file GSideBySideDialog.h
*
* This file contains the GSideBySideDialog class definition.
*/
#ifndef GSIDEBYSIDEDIALOG_H
#define GSIDEBYSIDEDIALOG_H

#include <QDialog>
#include "ui_GSideBySideDialog.h"

#define HTML_FILE "highlighted_diff_results.html"


//! Sidebyside dialog.
/*!
* \class GSideBySideDialog
*
* Defines an Sidebyside dialog.
*/
namespace Ui {
class GSideBySideDialog;
}

class GSideBySideDialog : public QDialog
{
    Q_OBJECT

public:
    explicit GSideBySideDialog(const QString &filePathA, const QString &filePathB, const QString &htmlPath, QWidget *parent = 0);
    ~GSideBySideDialog();


private:
    Ui::GSideBySideDialog *ui;
};

#endif // GSIDEBYSIDEDIALOG_H
