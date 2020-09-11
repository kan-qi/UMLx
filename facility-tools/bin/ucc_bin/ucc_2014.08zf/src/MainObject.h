//! Main counting object class definition.
/*!
* \file MainObject.h
*
* This file contains the main counting object class definition.
*/

#ifndef MainObject_h
#define MainObject_h

#include "CCodeCounter.h"
#include "CAdaCounter.h"
#include "CBatchCounter.h"
#include "CBashCounter.h"
#include "CCCounter.h"
#include "CCFScriptCounter.h"
#include "CColdFusionCounter.h"
#include "CCsharpCounter.h"
#include "CCshCounter.h"
#include "CCssCounter.h"
#include "CDataCounter.h"
#include "CFortranCounter.h"
#include "CHtmlCounter.h"
#include "CJavaCounter.h"
#include "CJavascriptCounter.h"
#include "CMakefileCounter.h"
#include "CMatlabCounter.h"
#include "CNeXtMidasCounter.h"
#include "CPascalCounter.h"
#include "CPerlCounter.h"
#include "CPhpCounter.h"
#include "CPythonCounter.h"
#include "CRubyCounter.h"
#include "CSqlCounter.h"
#include "CVbCounter.h"
#include "CVbscriptCounter.h"
#include "CVerilogCounter.h"
#include "CVHDLCounter.h"
#include "CWebCounter.h"
#include "CXMidasCounter.h"
#include "CXmlCounter.h"
#include "UserIF.h"

#define DUP_PAIRS_OUTFILE "DuplicatePairs.txt"
#define DUP_PAIRS_OUTFILE_CSV "DuplicatePairs.csv"
#define UNCOUNTED_FILES "outfile_uncounted_files.txt"
#define UNCOUNTED_FILES_CSV "outfile_uncounted_files.csv"

//! Main counting object class.
/*!
* \class MainObject
*
* Defines the main counting object class.
*/
class MainObject
{
public:
	MainObject();
	~MainObject();

	int MainProcess(int argc, char *argv[]);
	string GetLanguageName(ClassType class_type, const string &file_name = "");
	void GetLanguageExtensionMap(multimap<const string, string> *lang_ext_map);
	static void ShowUsage(const string &option = "", bool do_exit = true);
#ifdef QTGUI
	void ConnectUserIF(QWidget *parent = 0);
#endif

protected:
	//! List of source file elements.
	/*!
	* \typedef SourceFileList
	*
	* Defines a list of source file elements.
	*/
	typedef list<SourceFileElement> SourceFileList;

	//! Structure to contain count totals.
	/*!
	* \struct TotalValue
	*
	* Defines a structure to contain count totals.
	*/
	struct TotalValue
	{
		TotalValue()
		{
			total_line = 0;
			blank_line = 0;
			whole_comment = 0;
			embed_comment = 0;
			phy_direct = 0;
			phy_decl = 0;
			phy_instr = 0;
			log_direct = 0;
			log_decl = 0;
			log_instr = 0;
			num_of_file = 0;
		}

		unsigned int total_line;					//!< Total lines
		unsigned int blank_line;					//!< Blank lines
		unsigned int whole_comment;					//!< Whole line comments
		unsigned int embed_comment;					//!< Embedded comments
		unsigned int phy_direct;					//!< Physical directive SLOC
		unsigned int phy_decl;						//!< Physical data declaration SLOC
		unsigned int phy_instr;						//!< Physical executable instruction SLOC
		unsigned int log_direct;					//!< Logical directive SLOC
		unsigned int log_decl;						//!< Logical data declaration SLOC
		unsigned int log_instr;						//!< Logical executable instruction SLOC
		unsigned int num_of_file;					//!< Number of files
	};

	//! Structure to contain web language count totals.
	/*!
	* \struct WebTotalValue
	*
	* Defines a structure to contain web language count totals.
	*/
	struct WebTotalValue
	{
		WebTotalValue()
		{
			total_line = 0;
			blank_line = 0;
			whole_comment = 0;
			embed_comment = 0;
			for (int i = 0; i < 6; i++)
			{
				phy_direct[i] = 0;
				phy_decl[i] = 0;
				phy_instr[i] = 0;
				log_direct[i] = 0;
				log_decl[i] = 0;
				log_instr[i] = 0;
			}
			num_of_file = 0;
		}

		unsigned int total_line;					//!< Total lines
		unsigned int blank_line;					//!< Blank lines
		unsigned int whole_comment;					//!< Whole line comments
		unsigned int embed_comment;					//!< Embedded comments
		unsigned int phy_direct[6];					//!< Physical directive SLOC
		unsigned int phy_decl[6];					//!< Physical data declaration SLOC
		unsigned int phy_instr[6];					//!< Physical executable instruction SLOC
		unsigned int log_direct[6];					//!< Logical directive SLOC
		unsigned int log_decl[6];					//!< Logical data declaration SLOC
		unsigned int log_instr[6];					//!< Logical executable instruction SLOC
		unsigned int num_of_file;					//!< Number of files
	};

	//! Structure to contain all web language count totals for unified output.
	/*!
	* \struct AllWebTotalValue
	*
	* Defines a structure to contain all web language count totals.
	* If new web language is added, must update the count value here
	*  0 - HTML    1 - XML    2 - JSclnt  3 - VBSclnt
	*  4 - C#clnt  5 - JSsrv  6 - VBSsrv  7 - C#srv
	*  8 - PHP	   9 - Java  10 - SQL    11 - CF      12 - CFS
	*/
	struct AllWebTotalValue
	{
		AllWebTotalValue()
		{
			total_line = 0;
			blank_line = 0;
			whole_comment = 0;
			embed_comment = 0;
			for (int i = 0; i < 13; i++)
			{
				phy_direct[i] = 0;
				phy_decl[i] = 0;
				phy_instr[i] = 0;
				log_direct[i] = 0;
				log_decl[i] = 0;
				log_instr[i] = 0;
			}
			num_of_file = 0;
		}

		unsigned int total_line;					//!< Total lines
		unsigned int blank_line;					//!< Blank lines
		unsigned int whole_comment;					//!< Whole line comments
		unsigned int embed_comment;					//!< Embedded comments
		unsigned int phy_direct[13];				//!< Physical directive SLOC
		unsigned int phy_decl[13];					//!< Physical data declaration SLOC
		unsigned int phy_instr[13];					//!< Physical executable instruction SLOC
		unsigned int log_direct[13];				//!< Logical directive SLOC
		unsigned int log_decl[13];					//!< Logical data declaration SLOC
		unsigned int log_instr[13];					//!< Logical executable instruction SLOC
		unsigned int num_of_file;					//!< Number of files
	};

	//! Map of count totals.
	/*!
	* \typedef TotalValueMap
	*
	* Defines a map of count totals.
	*/
	typedef map<int, TotalValue> TotalValueMap;

	//! Map of web language count totals.
	/*!
	* \typedef WebTotalValueMap
	*
	* Defines a map of web language count totals.
	*/
	typedef map<WebType, WebTotalValue> WebTotalValueMap;

	void SetCounterOptions();
	void ResetCounterCounts();
	void UpdateCounterCounts(bool useListA = true);
	int ParseCommandLine(int argc, char *argv[]);
	int ReadAllFiles(StringVector &inputFileVector, const string &inputFileList = INPUT_FILE_LIST_NAME, bool useListA = true);
	void ProcessSourceList(bool useListA = true);
	ClassType DecideLanguage(const string &file_name, bool setCounter = true);
	bool IsSupportedFileExtension(const string &file_name);
	int PrintCountResults(bool useListA = true, const string &outputFileNamePrePend = "",
		StringVector* filesToPrint = NULL, bool excludeFiles = true);
	ofstream* GetOutputSummaryStream(const string &outputFileNamePrePend = "", bool csvOutput = false);
	void CloseOutputSummaryStream();
	int PrintCountSummary(TotalValueMap &total, WebTotalValueMap &webtotal,
		const string &outputFileNamePrePend = "");
	ofstream* GetTotalOutputStream(const string &outputFileNamePrePend = "", bool csvOutput = false);
	void CloseTotalOutputStream();
	int PrintTotalCountResults(bool useListA = true, const string &outputFileNamePrePend = "",
		StringVector* filesToPrint = NULL, bool excludeFiles = true);
	int PrintComplexityResults(bool useListA = true, const string &outputFileNamePrePend = "", bool printDuplicates = false);
	int PrintCyclomaticComplexity(bool useListA = true, const string &outputFileNamePrePend = "", bool printDuplicates = false);
	void PrintDuplicateSummary(bool useListA = true, const string &outputFileNamePrePend = "");
	void PrintDuplicateList(StringVector& myList1, StringVector& myList2, ofstream& outfile, bool csvFormat = false);
	void FindDuplicateFiles(SourceFileList &fileList, StringVector &dupList1, StringVector &dupList2, bool checkMatch = false);
	bool FindDuplicateFor(SourceFileList &compareList, SourceFileList::iterator &sfi,
		StringVector &dupList1, StringVector &dupList2, bool checkMatch = false);
	void CompareForDuplicate(srcLineVector &firstFile, srcLineVector &secondFile, double &changedLines, double &totalLines);
	void ReadUserExtMapping(const string &extMapFile);
	void CreateExtMap();
	void WriteUncountedFile(const string &msg, const string &uncFile, bool useListA = true, bool csvOutput = false);

	UserIF *userIF;									//!< User interface for presenting messages/progress to user

	ofstream output_summary;						//!< Output summary file stream
	ofstream output_summary_csv;					//!< Output summary CSV file stream
	ofstream output_file;							//!< Total output file stream
	ofstream output_file_csv;						//!< Total output CSV file stream
	
	StringVector duplicateFilesInA1;				//!< List of duplicate file sources in baseline A
	StringVector duplicateFilesInA2;				//!< List of duplicate files in baseline A
	StringVector duplicateFilesInB1;				//!< List of duplicate file sources in baseline B
	StringVector duplicateFilesInB2;				//!< List of duplicate files in baseline B

	SourceFileList SourceFileA;						//!< List of source files in baseline A
	SourceFileList SourceFileB;						//!< List of source files in baseline B

	string BaselineFileName1;						//!< Baseline file name 1
	string BaselineFileName2;						//!< Baseline file name 2

	string cmdLine;									//!< Executed command line string
	string dirnameA;								//!< Directory name for baseline A
	string dirnameB;								//!< Directory name for baseline B
	string outDir;									//!< Output directory
	string userExtMapFile;							//!< User extension map file

	double duplicate_threshold;						//!< % changed threshold for determining duplicate content
	StringVector listFilesToBeSearched;				//!< List of options for files to be searched
	size_t lsloc_truncate;							//!< # of characters allowed in LSLOC for differencing (0=no truncation)

	bool isDiff;									//!< Has differencing been requested (-d)?
	bool use_CommandLine;							//!< Read file names from command line specifications or from input files
	double match_threshold;							//!< % threshold for matching, if greater then added/deleted instead of modified

	bool print_cmplx;								//!< Print complexity and keyword counts
	bool print_csv;									//!< Print CSV report files
	bool print_ascii;								//!< Print ASCII text report files
	bool print_legacy;								//!< Print legacy formatted ASCII text report files
	bool print_unified;								//!< Print all counting files in a single unified file
	bool clearCaseFile;								//!< Target files are extracted from the ClearCase CM
	bool followSymLinks;							//!< Unix symbolic links are followed to their linked files/dirs
    bool visualDiff;                                //!< Print visual diff

	map<int, CCodeCounter*> CounterForEachLanguage;	//!< List of code counters for each language
	map<string, string> LanguageExtensionMap;		//!< List of languages and their extensions

	CCodeCounter* counter;							//!< Single language code counter
};

#endif
