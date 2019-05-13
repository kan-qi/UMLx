//! The main UCC function.
/*!
* \file main.cpp
*
* This file contains the main UCC function.
*/

#include <string>
#include "DiffTool.h"

using namespace std;

/*!
* Main function.
*
* \param argc number of arguments
* \param argv argument list
*
* \return function status
*/
int main(int argc, char *argv[])
{
	try
	{
		// determine whether differencing functionality is needed
		bool doDiff = false;
		string myArg;
		for (int i = 0; i < argc; i++)
		{
			myArg = argv[i];
			if (myArg == "-d")
			{
				doDiff = true;
				break;
			}
			else if (myArg == "?" || myArg == "-help" || myArg == "-h" || myArg == "/?")
			{
				// check whether a help option has been specified
				if (argc > i + 1)
				{
					// show usage option help
					MainObject::ShowUsage(argv[i+1]);
				}		
				else
				{
					// show general usage help
					MainObject::ShowUsage();
				}
			}
		}
		if (doDiff)
		{
			// run the DiffTool to include differencing
			DiffTool diffTool;
			diffTool.diffToolProcess(argc, argv);
		}
		else
		{
			// if no differencing functionality required, just call the UCC
			MainObject mainObject;
			mainObject.MainProcess(argc, argv);
		}
	}
	catch (...)
	{
		cout << "Error: a general exception occurred. Please try again." << endl;
	}

	return 0;
}
