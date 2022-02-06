#!/bin/sh
markdown=$(mktemp --suffix=.md)
html=$(mktemp --suffix=.html)
month=$(faketime '9 days ago' date +"%B %Y")
introFolder=$(jq -r '.introFolder' < config.json)

# Get each piece of information we need, piping it all into a temporary
# Markdown file.
{
  echo "# Entropy Arbitrage Newsletter, ${month}"
  echo
  ccal --date
  echo
  echo "...assuming you follow the"
  echo "[Common Calendar](https://github.com/jcolag/CommonCalendar),"
  echo "of course, but I assume you probably do not.  Or should."
  echo "Ahem.  Newsletter!"
  echo
  echo "**Entropy Arbitrage** welcomed visitors from"
  node matomo-countries.js
  echo "this month, which never fails to please me.  Remember, all content is"
  echo "made available under the CC-BY-SA license, so if anybody needs to"
  echo "provide a translation, you don't need my permission, provided that"
  echo "you comply with the terms of the license.  However, feel free to ask"
  echo "for help or otherwise reach out, too."
  echo
  echo "# $(faketime '9 days ago' date +%B)'s Idle Thoughts"
  echo
  cat "${introFolder}/$(faketime '9 days ago' date +"%Y-%m").md"
  echo
  echo "# Blog Posts for ${month}"
  echo
  echo "In case you missed one and don't like RSS readers, here's a round-up of"
  echo "the past month's worth of posts."
  echo
  node posts.js
  echo
  echo "I also revisited and updated some older posts, for various reasons."
  echo
  sh updates.sh
  echo
  echo "Significant changes to the text come with clear and dated markings."
  echo "Changing the wording or correcting a typo is more routine, but it."
  echo "indicates that I've at least been looking at the post.  Longer"
  echo "changes probably have a brief write-up in this very newsletter."
  echo
  echo "The most popular posts on the blog have been"
  node matomo-popular.js
  echo " for the month."
  echo
  echo "# Articles I've Been Reading"
  echo
  echo "You've seen some of these already in Friday posts, but here's more from"
  echo "the sources in my RSS reader that I thought were worth reading."
  echo
  node ttrss.js
  echo
  echo "# Web Pages That Caught My Attention"
  echo
  echo "These are pages I bookmarked, basically.  They might be old articles,"
  echo "non-articles, fiction, or any number of other possibilities.  You've"
  echo "seen the web.  You know what it's like out there.  And you also know"
  echo "that half the titles are probably bogus, because people are *terrible*"
  echo "at setting their page titles to something useful."
  echo
  node bookmark.js
  echo
  echo "That's it for this month.  Stop by the blog and leave comments or"
  echo "contact me however else you see fit."
  echo
  echo "---John"
} >> "${markdown}"

# Convert the markdown to HTML, with any styling we want to add stored
# in style.css.
pandoc --from=markdown \
       --to=html \
       --output="${html}" \
       --standalone \
       --table-of-contents \
       --include-in-header=style.css \
       --self-contained \
       --section-divs \
       --metadata pagetitle="For&nbsp;E-Mail" \
       "${markdown}"
# Set up the e-mail campaign.
node generate.js "${html}"
# Clean up the temporary files.  When I want to preview the file for debugging,
# I'll call something like:
#   firefox "${html}"
# Copy the Markdown file for possible future archiving.
cp "${markdown}" "news-$(faketime '9 days ago' date +"%Y-%m").md"
# Delete the temporary files; comment this out, if you're going to open the
# temporary HTML file in a browser, since it can delete too quickly for
# the browser to read.
rm "${markdown}" "${html}"

