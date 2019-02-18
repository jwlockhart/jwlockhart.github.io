Title: When ID numbers get rounded
Date: 2019-02-17 20:56
Modified: 2019-02-17 20:56
Category: common_problems
Tags: numbers, problems
Slug: rounding-ids

Almost everyone doing computational social science will, at some point, encounter really big ID numbers. When those ID numbers get rounded, it leads to a world of frustration. So in this inaugural post, I'll explain what the problem is, what some common causes are, and how to fix it. 

## The problem

IDs for many data sets can stretch into the quintillions (that's a billion-billions). This happens, for example, in twitter data, where tweets have ID numbers like [1095603268586270720](https://twitter.com/mc_hankins/status/1095603268586270720). Problem is, when we start working with this data, we often see it converted to scientific notation like this: `1.0956032685862707e+18`.

**What's going on?** Computers have two main ways to store numbers in their memory ("data types"). The first is as an `integer` or `int`. This stores any whole number, positive or negative, such as -1, 0, 3, etc. `int` is an exact data type: its value is exactly what you say. The second way computers store numbers is as a "floating point number" or `float`. These can hold numbers that are not whole, such as 3.25. Unfotunately, `float` is not an exact data type: it relies on approximations (just like $1/3$ has to be approximated when we write out $0.33333$). So computers sometimes do strange things. In most programming languages:

    #!python
    0.1 + 0.1 + 0.1 == 0.3
    False 

This is due to tiny rounding and approximation errors. In python: 

    #!python
    x = 0.1 + 0.1 + 0.1 
    print(x)
    0.30000000000000004

This almost never matters, because the approximations are accurate to many more decimal places than we use in everyway work. But when it comes to ID numbers, we need *exact* matches, so this causes problems. This can be made worse by saving the data. For example:

    #!python
    x = float(1095603268586270720)
    y = float(1095603268586270724)
    print(x)
    1.0956032685862707e+18
    print(y)
    1.0956032685862707e+18
    
Notice that the version that got printed is missing the last two digits of the ID number, and we can no longer distinguish `x` and `y` from one another. Those digits are still in memory, but they're hidden for display purposes. **BUT** if it gets saved to a file like this, those digits are gone forever. Often the rounding when programs save data is more agressive than this.

**Bottom line:** ID numbers are whole numbers and the exact value is extremely important, so they are best storied as `int`. When they show up with decimal points in them, it is because the computer has decided to store them as `float` instead.[ref]There are many other data types for numbers, but most of them are variations on these two. `long` is a bigger `int`, `double` is a bigger `float`, and so on.


## Common causes
- Old software
	- **Stata**, and software like it, have their origins in the 1980s, when computers had very limited abilities. That resulted in some clever optimizations to make the most of the available resources. One of these optimizations is saving space by storing large numbers as approximations instead of exact values. Unfortunately, [Stata still does this in 2019](https://stats.idre.ucla.edu/stata/faq/why-am-i-losing-precision-with-large-whole-numbers-such-as-an-id-variable/). If Stata is part of your workflow, it might be the culprit. Fortunately, that link also has a workaround. 
	- **Excel** has a habit of doing this too, although for aesthetic rather than practical reasons. Fussing with the number formats is your best bet, if you want to use excel.
- Missing values
	- **Python** and other modern languages like **R**[ref]I think there is a related issue for R, but I haven't personally encountered it.[/ref] are perfectly happy to store huge numbers as exact values. Unfortunately, python stores missing values as special cases of `float` (`np.NaN`). `pandas` wants all the values in a column of a data frame to be of the same type. So if one ID is missing, it becomes a `float`, and the whole column of perfectly happy `int` values suddenly becomes a column of `float`s. 
- Bad input data
	- If the data you're working with were saved with this error, then nothing you do can undo it.[ref]I wasted a whole month once trying to salvage mangled data. Abandon all hope, ye who enter here.[/ref] You'll need to go back to a version of the data with full ID numbers and work from there. In order to check how the data are saved, open the input data file in a text editor, or in the terminal peak at the head of the file `$ head my_data.csv`.

## Fixes
- The simplest fix is to treat ID numbers as `string` data. Because the computer sees strings as text, it won't try to round them. 
	- For many applications, this will work fine.
	- This is the solution Twitter uses: it is why all of their IDs come from the API in both number and string format.
	- This is also the solution Reddit uses (their ID numbers are written in hexadecimal format, so programs assume they are strings by default). 
	- Strings are a bit slower for computers to work with, though, and they take up more memory to store. If your data are really big, you might run into issues with this approach. 
- Make new IDs. If you don't need the original IDs, you can just make a new column of IDs counting up from zero. 
	- In python/pandas `df.reindex().reset_index()`
	- In py/spark `df.withColumn('id', monotonically_increasing_id())`
- Drop rows with missing IDs. 
	- In pandas, `int` columns become `float` when there are missing values in them. If you don't need the rows that have missing ID numbers, removing them is an easy fix. Then you can convert them back to integers with either `df.id_col.astype(int)` or `pd.to_numeric(df.id_col, downcast='integer')`.

Cheers, Y'all. 

### Notes
