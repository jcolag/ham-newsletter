# ham-newsletter
Scripts to assemble my monthly newsletter

When I decided to launch a [monthly e-mail newsletter](https://entropy-arbitrage.mailchimpsites.com/) for [my blog](https://john.colagioia.net/blog/), I didn't want to hand-write everything.  For example, to provide the articles I've been reading, it would be a waste of everybody's time for my to input it by hand.

Plus, I chose Mailchimp and, while I don't see much trouble with the *service*, I'm not impressed with their user interface.  Therefore, scripts!

If you want to create the same sort of newsletter---and assuming that you *also* use [Firefox](https://www.mozilla.org/en-US/firefox/), [Matomo](https://matomo.org/), a blog, and [Tiny Tiny RSS](https://tt-rss.org/)---you should be able to get everything working by filling out [`config.json`](config.json) and then just running [`create.sh`](create.sh).  The script will assemble a Markdown file, convert it (using [pandoc](https://pandoc.org/), which you'll need to install, if you don't already have it) to HTML, send it to Mailchimp, and open the new e-mail campaign in your default browser to review, edit, and send.

If you use different applications than I do, you'll need to put in more work, of course.

