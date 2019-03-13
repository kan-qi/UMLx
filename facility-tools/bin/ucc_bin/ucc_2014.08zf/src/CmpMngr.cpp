//! Compare manager class methods.
/*!
 * \file CmpMngr.h
 *
 * This file contains the compare manager class methods.
 * This class implements the GDiff07 algorithm, developed by Harley Green for
 * The University of Southern California Center for Systems and Software Engineering (USC-CSSE),
 * in conjunction with The Aerospace Corporation.
 * The GDiff07 algorithm breaks the counting process for finding differences between two revisions of a file
 * into several steps. First it counts and removes all unmodified lines during this process lines that are
 * not matched are put into a separate list for each of the two files.
 * These lists are then searched for swapped lines (DISABLED)
 * and have those removed. Then the remaining lines are searched again for modified matches. Once the unmodified, swapped
 * and modified lines are removed the only remaining lines will be either added or deleted so no further action is necessary
 * and the algorithm is finished.
 * Uses function for finding a similar line provided by J. Kim 10/09/2006 as part of the USC-CSSE Development process.
 */

#include "CmpMngr.h"
#include "CUtil.h"

using namespace std;

const string CmpMngr::MARKER_TABLE[] = {"MODIFIED", "UNMODIFIED", "DELETED", "ADDED"};

CmpMngr::CmpMngr(){}

CmpMngr::CmpMngr(ofstream *file_stream)
{
    file_dump_stream=file_stream;
}

/*!
 * Calls routines to get the final count of the differences between two files.
 *
 * \param baseFileMap list of base files
 * \param compFileMap list of comparison files
 * \param match_threshold % threshold for matching, if greater then added/deleted instead of modified
 */
void CmpMngr::Compare(srcLineVector* baseFileMap, srcLineVector* compFileMap, double match_threshold)
{
    MATCH_THRESHOLD = match_threshold;
    nNochangedLines = nChangedLines = nAddedLines = nDeletedLines = 0;
    
    // First, fill out the base file vector and comp file vector.
    fill_source_code_vec(baseFileMap, this->base_file);
    fill_source_code_vec(compFileMap, this->comp_file);
    
    mapping_list.clear();
    
    FindUnmodifiedLines(baseFileMap, compFileMap);
    FindModifiedLines(baseFileMap, compFileMap);
    
    // remaining lines are added or deleted, no further details needed to be searched.
    for (srcLineVector::iterator iter = baseFileMap->begin(); iter != baseFileMap->end(); ++iter)
    {
        for (srcLineVector::mapped_type::iterator it = iter->second.begin();
             it != iter->second.end();
             ++ it) {
            mapping_list.push_back(mapping_code(*it, 0, DELETED));
        }
        
        nDeletedLines += iter->second.size();
    }
    
    for (srcLineVector::iterator iter = compFileMap->begin(); iter != compFileMap->end(); ++iter)
    {
        for (srcLineVector::mapped_type::iterator it = iter->second.begin();
             it != iter->second.end();
             ++ it) {
            mapping_list.push_back(mapping_code(0, *it, ADDED));
        }
        
        nAddedLines += iter->second.size();
    }
    //ofstream *file_dump_stream;
    
    print_info(file_dump_stream);
}

/*!
 * Finds the number of modified lines, anything remaining in lists is either deleted or added.
 *
 * \param aHm list of base files
 * \param bHm list of comparison files
 */
void CmpMngr::FindModifiedLines(srcLineVector* aHm, srcLineVector* bHm)
{
    srcLineVector* listA(NULL);
    srcLineVector* listB(NULL);
    stringSizeMap mySSList;
    
    size_t minSize(0);
    size_t maxSize(0);
    size_t maxSizeListA(0);
    
    bool deletedB, deletedA;
    
    if (aHm->size() == 0 || bHm->size() == 0)
        return;
    
    bool base_larger_than_comp(true);
    
    // pick the shortest list to do the sorting on
    if (aHm->size() > bHm->size())
    {
        listA = bHm;
        listB = aHm;
        base_larger_than_comp = true;
    }
    else
    {
        listA = aHm;
        listB = bHm;
        base_larger_than_comp = false;
    }
    
    // create a map of string size -> [iterators]
    // quickly access the locations of lines that are in valid size range of modified line for the given search line
    for (srcLineVector::iterator myI = listA->begin(); myI != listA->end(); ++myI)
    {
        
        // populate with the number of copies of this string
        stringList myList(myI->second.size(), myI->first);
        
        stringSizeMap::iterator result_iter = mySSList.find(myI->first.size());
        
        if (result_iter != mySSList.end())
        {
            // already had a copy of something this size
            result_iter->second.insert(result_iter->second.begin(), myList.begin(), myList.end());	//append the list
        }
        else
        {
            mySSList[myI->first.size()] = myList;
        }
        
        if (maxSizeListA < (*myI).first.size())
        {
            maxSizeListA = (*myI).first.size();
        }
    }
    
    // iterate through the longer list and searches for modified lines in the shorter list
    // find the min and max size range for modified lines and only looks through those specific locations
    // since the map is sorted, lookup using find is log(n) to get the iterator
    
    // once an entry is found of a list of lines that have the same size in valid modified range, checks each to see if it is modified
    for (srcLineVector::iterator myI = listB->begin(); myI != listB->end();)
    {
        // find the valid size range (dictated by the MATCH_TRESHOLD)
        minSize = static_cast<size_t>((*myI).first.length() * (MATCH_THRESHOLD / 100));
        maxSize = MATCH_THRESHOLD != 0 ? static_cast<size_t>((*myI).first.length() / (MATCH_THRESHOLD / 100)) : maxSizeListA;
        if (maxSize > maxSizeListA)
        {
            maxSize = maxSizeListA;
        }
        
        deletedB = false;
        deletedA = false;
        
        for (size_t i = minSize; i <= maxSize; ++i)
        {
            // find the list of strings of this length
            stringSizeMap::iterator mySSI = mySSList.find(i);
            if (mySSI != mySSList.end())
            {
                // found some
                for (stringList::iterator mySLI = mySSI->second.begin(); mySLI != mySSI->second.end();)
                {
                    if (SimilarLine(*mySLI, myI->first))
                    {
                        string prev(*mySLI);
                        srcLineVector::iterator listAi = listA->find(prev);
                        
                        vector<size_t> *base_ptr(NULL);
                        vector<size_t> *comp_ptr(NULL);
                        
                        if (base_larger_than_comp)
                        {
                            comp_ptr = &listAi->second;
                            base_ptr = &myI->second;
                        }
                        else
                        {
                            base_ptr = &listAi->second;
                            comp_ptr = &myI->second;
                        }
                        
                        // eliminates the need to call SimilarLine function on every entry if they are the same
                        while (myI->second.size() > 0 && (mySLI != mySSI->second.end() && (*mySLI) == prev))
                        {
                            vector<size_t>::const_iterator base_iter = base_ptr->end() - 1;
                            vector<size_t>::const_iterator comp_iter = comp_ptr->end() - 1;
                            mapping_list.push_back(mapping_code(*base_iter, *comp_iter, MODIFIED));
                            base_ptr->pop_back();
                            comp_ptr->pop_back();
                            
                            stringList::iterator tmpSLI = mySLI++;
                            mySSI->second.erase(tmpSLI);
                            deletedA = true;
                            ++nChangedLines;
                        }
                        
                        if (myI->second.size() == 0)
                        {
                            srcLineVector::iterator tmpI = myI++;
                            listB->erase(tmpI);
                            deletedB = true;
                        }
                        
                        if (listAi->second.size() == 0)
                        {
                            listA->erase(listAi);
                        }
                        
                        if (deletedB || deletedA)
                        {
                            break;
                        }
                    }
                    else
                    {
                        ++mySLI;
                    }
                }
                
                if (deletedB || deletedA)
                {
                    break;
                }
            }
        }
        
        if (!deletedB)
        {
            ++myI;
        }
    }
}

/*!
 * Performs a binary search to find unmodified lines, relies on fact that they are in
 * STL hash (srcLineVector) so they are already sorted and the find function is log(n)
 *
 * \param aHm list of base files
 * \param bHm list of comparison files
 */
void CmpMngr::FindUnmodifiedLines(srcLineVector* aHm, srcLineVector* bHm)
{
    srcLineVector* listA;
    srcLineVector* listB;
    bool base_larger_than_comp(true);
    
    if (aHm->size() > bHm->size())
    {
        listA = bHm;
        listB = aHm;
        base_larger_than_comp = true;
    }
    else
    {
        listA = aHm;
        listB = bHm;
        base_larger_than_comp = false;
    }
    
    for (srcLineVector::iterator myI = listA->begin(); myI != listA->end();)
    {
        bool deleted = false;
        srcLineVector::iterator result = listB->find((*myI).first);
        if (result != listB->end())
        {
            vector<size_t> *base_ptr(NULL);
            vector<size_t> *comp_ptr(NULL);
            
            if (base_larger_than_comp)
            {
                comp_ptr = &myI->second;
                base_ptr = &result->second;
            }
            else
            {
                base_ptr = &myI->second;
                comp_ptr = &result->second;
            }
            
            while (base_ptr->size() > 0 && comp_ptr->size() > 0)
            {
                vector<size_t>::const_iterator base_iter = base_ptr->end() - 1;
                vector<size_t>::const_iterator comp_iter = comp_ptr->end() - 1;
                mapping_list.push_back(mapping_code(*base_iter, *comp_iter, UNMODIFIED));
                base_ptr->pop_back();
                comp_ptr->pop_back();
                nNochangedLines++;
            }
            
            if ((*myI).second.size() == 0)
            {
                srcLineVector::iterator tmpI = myI++;
                listA->erase(tmpI);
                deleted = true;
            }
            
            if ((*result).second.size() == 0)
            {
                listB->erase(result);
            }
        }
        
        if (!deleted)
        {
            ++myI;
        }
    }
}

/*!
 * Determines whether two lines are similar.
 * Originally written by J. Kim 10/09/2006
 * Revised version of the original method
 * - order of characters taken into account
 * - criteria for determining 'similar lines' :
 *   length(LCS) / length(baseLine) * 100 >= MATCH_THRESHOLD &&
 *   length(LCS) / length(compLine) * 100 >= MATCH_THRESHOLD
 * - above criteria solves two problems encountered in the original function
 * <1>
 * similar_lines("ABC", "ABCDEF") = 1
 * similar_lines("ABCDEF", "ABC") = 0
 * => because of this, if we modify a line from the original file, sometimes
 * we get 1 MODIFIED and sometimes get 1 ADDED + 1 DELETED.
 * <2>
 * "ABCDEF" and "FDBACE" classified as similar lines (order not taken into account)
 * => because of this, when we delete a certain line from the original
 * file and insert a new one, instead of getting 1 ADDED and 1 DELETED, we might get 1 MODIFIED.
 * (ex)
 * DELETE: out = "test sentence";
 * INSERT: cout << "censstetetne";
 * and get 1 MODIFIED
 * instead of getting 1 ADDED + 1 DELETED
 *
 * \param baseLine base line
 * \param compareLine comparison line
 *
 * \return whether two lines are similar
 */
bool CmpMngr::SimilarLine(const string &baseLine, const string &compareLine)
{
    int m, n, i, j, k;
    double LCSlen;
    m = (int)baseLine.size();
    n = (int)compareLine.size();
    vector<int> x1, x2;
    x1.resize(m + 1, 0);
    x2.resize(m + 1, 0);
    
    // compute length of LCS
    // - no need to use CBitMatrix
    for (j = n - 1; j >= 0; j--)
    {
        for (k = 0; k <= m; k++)
        {
            x2[k] = x1[k];
            x1[k] = 0;
        }
        for (i = m - 1; i >= 0; i--)
        {
            if (baseLine[i] == compareLine[j])
            {
                x1[i] = 1 + x2[i+1];
            }
            else
            {
                if (x1[i+1] > x2[i])
                {
                    x1[i] = x1[i+1];
                }
                else
                {
                    x1[i] = x2[i];
                }
            }
        }
    }
    LCSlen = x1[0];
    if ((LCSlen / (double)m * 100 >= MATCH_THRESHOLD) &&
        (LCSlen / (double)n * 100 >= MATCH_THRESHOLD))
        return true;
    else 
        return false;
}

void CmpMngr::fill_source_code_vec(const srcLineVector *file_map, vector<string> &source_code_vec)
{
    size_t file_size(0); // This variable records the size of the file. It should equal to the maximum line number in file map.
    vector<code_line_pair> temp;
    for (srcLineVector::const_iterator iter = file_map->begin(); iter != file_map->end(); ++iter)
    {
        const vector<size_t> &line_num_list(iter->second);
        for (vector<size_t>::const_iterator it = line_num_list.begin(); it != line_num_list.end(); ++it)
        {
            temp.push_back(make_pair(&iter->first, *it));
        }
    }
    
    sort(temp.begin(), temp.end(), compare_code_line_pair);
    
    source_code_vec.reserve(file_size);
    
    for (vector<code_line_pair>::const_iterator iter = temp.begin(); iter != temp.end(); ++iter)
    {
        source_code_vec.push_back(*(iter->first));
    }
}

void CmpMngr::print_info(ofstream *file_dump_stream) const
{
    if (file_dump_stream)
    {
        for (vector<mapping_code>::const_iterator iter = mapping_list.begin(); iter != mapping_list.end(); ++iter)
        {
            *file_dump_stream << iter->base_file_line_num << '\t' << iter->comp_file_line_num << '\t' << MARKER_TABLE[iter->marker] << '\n';
        }
        *file_dump_stream << endl;
    }
}

bool compare_code_line_pair(const code_line_pair &lhs, const code_line_pair &rhs)
{
    return lhs.second < rhs.second;
}

mapping_code::mapping_code(const size_t base_file, const size_t comp_file, const MARKER mk) :
base_file_line_num(base_file), comp_file_line_num(comp_file), marker(mk)
{
}

mapping_code::mapping_code(const mapping_code &rhs) : base_file_line_num(rhs.base_file_line_num),
comp_file_line_num(rhs.comp_file_line_num), marker(rhs.marker)
{
}
