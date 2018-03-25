//! Code counter class definition for the Batch shell script language.
/*!
* \file CBatchCounter.h
*
* This file contains the code counter class definition for the Batch shell script language.
* This also includes the Korn shell language.
*/

#ifndef CBatchCounter_h
#define CBatchCounter_h

#include "CCodeCounter.h"

//! Batch shell script code counter class.
/*!
* \class CBatchCounter
*
* Defines the Batch shell script code counter class.
*/
class CBatchCounter : public CCodeCounter
{
public:
	CBatchCounter();

protected:
	virtual int PreCountProcess(filemap* fmap);
	virtual int LanguageSpecificProcess(filemap* fmap, results* result, filemap* fmapBak = NULL);
	void LSLOC(results* result, string line, size_t lineNumber, string lineBak, string &strLSLOC, 
		string &strLSLOCBak, bool &data_continue, unsigned int &temp_lines, unsigned int &phys_exec_lines,
		unsigned int &phys_data_lines, StringVector &loopLevel);
	int ParseFunctionName(const string &line, string &lastline, filemap &functionStack, string &functionName, 
		unsigned int &functionCount);
	int CountComplexity(filemap* fmap, results* result);

	StringVector continue_keywords;		//!< List of keywords to continue to next line
};

#endif
