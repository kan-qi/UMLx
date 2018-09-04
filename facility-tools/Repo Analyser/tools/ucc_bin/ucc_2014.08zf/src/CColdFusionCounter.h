//! Code counter class definition for the ColdFusion language.
/*!
* \file CColdFusionCounter.h
*
* This file contains the code counter class definition for the ColdFusion language.
*/

#ifndef CColdFusionCounter_h
#define CColdFusionCounter_h

#include "CTagCounter.h"

//! ColdFusion code counter class.
/*!
* \class CColdFusionCounter
*
* Defines the ColdFusion code counter class.
*/
class CColdFusionCounter : public CTagCounter
{
public:
	CColdFusionCounter();
protected:
	virtual int PreCountProcess(filemap* fmap);
	int ParseFunctionName(const string &line, string &lastline, filemap &functionStack, string &functionName, 
		unsigned int &functionCount);
};

#endif
