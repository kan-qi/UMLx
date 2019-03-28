//! User interface class methods.
/*!
* \file UserIF.cpp
*
* This file contains the user interface class methods.
*/

#include "UserIF.h"
#include <time.h>

#ifndef QTGUI

/*!
* Constructs a UserIF object.
*/
UserIF::UserIF()
{
	errPath = "";
	execCanceled = false;
}

/*!
* Sets the execution error file.
*
* \param outDir output directory
*/
void UserIF::SetErrorFile(const string &outDir)
{
	time_t myTime;
	struct tm *myLocalTime;
	time(&myTime);
#if defined UNIX || defined MINGW
	myLocalTime = localtime(&myTime);
#else
	struct tm myLT;
	localtime_s(&myLT, &myTime);
	myLocalTime = &myLT;
#endif
	char s[50];
	strftime(s, 50, "error_log_%m%d%Y_%I%M%S.txt", myLocalTime);
	if (outDir.empty())
		errPath = s;
	else
		errPath = outDir + s;
}

/*!
* Adds a message entry to the error log.
*
* \param err error string
* \param logOnly flag to only write to log (no user output)
* \param preNL number of preceding new lines in user output (default=0)
* \param postNL number of proceeding new lines in user output (default=1)
*/
void UserIF::AddError(const string &err, bool logOnly, int preNL, int postNL)
{
	if (err.empty() || errPath.empty())
		return;

	// open the error file if not already opened
	if (!errFile.is_open())
	{
		errFile.open(errPath.c_str(), ofstream::out);
		if (!errFile.is_open())
		{
			cerr << "Error: Failed to open error log file" << endl;
			return;
		}
	}
	errFile << err << endl;
	if (!logOnly)
	{
		for (int i = 0; i < preNL; i++)
			cout << endl;
		cout << err;
		for (int i = 0; i < postNL; i++)
			cout << endl;
		cout << flush;
	}
}

/*!
* Updates progress by displaying a message and passing percent completion.
*
* \param msg message string
* \param postNL include a new line (default=true)
* \param pct percent completion (-1 if none)
* \param progressCnt progress count <= progress total
* \param progressTotal progress total -> 100%
*/
void UserIF::updateProgress(const string &msg, bool postNL,
	int pct, unsigned int progressCnt, unsigned int progressTotal)
{
	if (!postNL || pct >= 0)
	{
		if (!msg.empty())
			cout << msg << flush;
		if (pct >= 0)
		{
			if (progressTotal == 1)
				cout << ".....100%";
			else
			{
				if (progressCnt == 1)
					cout << ".....";
				else
					cout << "\b\b\b\b";
				if (pct < 10)
					cout << "..";
				else if (pct < 100)
					cout << ".";
				cout << pct << "%";
			}
			cout.flush();
		}
	}
	else if (!msg.empty())
		cout << msg << endl;
}

/*!
* Checks whether execution has been canceled by the user.
*
* \return execution canceled?
*/
bool UserIF::isCanceled()
{
	return(execCanceled);
}

#else

#include <QApplication>

/*!
* Constructs a UserIF object.
*
* \parent parent widget
*/
UserIF::UserIF(QWidget *parent)
	: QObject(parent)
{
	errPath = "";
	execCanceled = false;

	if (parent)
	{
		connect(this, SIGNAL(updatedLog(const QString &)), parent, SLOT(updateLog(const QString &)));
		connect(this, SIGNAL(updatedProgress(const QString &, int)), parent, SLOT(updateProgress(const QString &, int)));
		connect(parent, SIGNAL(canceledExecution()), this, SLOT(cancelExecution()));
	}
}

/*!
* Sets the execution error file.
*
* \param outDir output directory
*/
void UserIF::SetErrorFile(const string &outDir)
{
	time_t myTime;
	struct tm *myLocalTime;
	time(&myTime);
#if defined UNIX || defined MINGW
	myLocalTime = localtime(&myTime);
#else
	struct tm myLT;
	localtime_s(&myLT, &myTime);
	myLocalTime = &myLT;
#endif
	char s[50];
	strftime(s, 50, "error_log_%m%d%Y_%I%M%S.txt", myLocalTime);
	if (outDir.empty())
		errPath = s;
	else
		errPath = outDir + s;
}

/*!
* Adds a message entry to the error log.
*
* \param err error string
* \param logOnly flag to only write to log (no user output)
* \param preNL number of preceding new lines in user output (default=0)
* \param postNL number of proceeding new lines in user output (default=1)
*/
void UserIF::AddError(const string &err, bool /*logOnly*/, int preNL, int postNL)
{
	if (err.empty() || errPath.empty())
		return;

	// open the error file if not already opened
	if (!errFile.is_open())
	{
		errFile.open(errPath.c_str(), ofstream::out);
		if (!errFile.is_open())
		{
			emit updatedLog("Error: Failed to open error log file\n");
			return;
		}
	}
	errFile << err << endl;

	QString errStr = err.c_str();
	for (int i = 0; i < preNL; i++)
		errStr = "\n" + errStr;
	for (int i = 0; i < postNL; i++)
		errStr += "\n";
	emit updatedLog(errStr);
	QApplication::processEvents();
}

/*!
* Updates progress by displaying a message and passing percent completion.
*
* \param msg message string
* \param postNL include a new line (default=true)
* \param pct percent completion (-1 if none)
* \param progressCnt progress count <= progress total
* \param progressTotal progress total -> 100%
*/
void UserIF::updateProgress(const string &msg, bool /*postNL*/,
	int pct, unsigned int /*progressCnt*/, unsigned int /*progressTotal*/)
{
	if (!msg.empty() || pct >= 0)
	{
		emit updatedProgress(QString(msg.c_str()), pct);
		QApplication::processEvents();
	}
}

/*!
* Cancels the running execution.
*/
void UserIF::cancelExecution()
{
	execCanceled = true;
}

/*!
* Checks whether execution has been canceled by the user.
*
* \return execution canceled?
*/
bool UserIF::isCanceled()
{
	return(execCanceled);
}

#endif
