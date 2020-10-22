# ham-newsletter
Scripts to assemble my monthly newsletter

When I decided to launch a [monthly e-mail newsletter](https://entropy-arbitrage.mailchimpsites.com/) for [my blog](https://john.colagioia.net/blog/), I didn't want to hand-write everything.  For example, to provide the articles I've been reading, it would be a waste of everybody's time for my to input it by hand.

Plus, I chose Mailchimp and, while I don't see much trouble with the *service*, I'm not impressed with their user interface.  Therefore, scripts!

If you want to create the same sort of newsletter---and assuming that you *also* use [Firefox](https://www.mozilla.org/en-US/firefox/), [Matomo](https://matomo.org/), a blog, and [Tiny Tiny RSS](https://tt-rss.org/)---you should be able to get everything working by filling out [`config.json`](config.json), generating a JSON file (named `blogurls.json`) where page titles are the keys and URLs are the values (I generate mine from the blog), and then just running [`create.sh`](create.sh).  The script will assemble a Markdown file, convert it (using [pandoc](https://pandoc.org/), which you'll need to install, if you don't already have it) to HTML, send it to Mailchimp, and open the new e-mail campaign in your default browser to review, edit, and send.  Just watch out for failures, since a network glitch could derail any of the API requests.

You might obviously want to *edit* `create.sh`, too, since the headings and explanations are in my voice.

In the likely case that you use different applications than I do, you'll need to put in more work, of course.

**Please Note**:  The sample `config.json` file is *not* covered by the AGPL like the rest of the repository is.  It is released under the terms of the [CC0 1.0 Universal Public Domain Dedication](https://creativecommons.org/publicdomain/zero/1.0/).

Oh, the name!  [Ham the Astrochimp](https://en.wikipedia.org/wiki/Ham_(chimpanzee)) was the first hominid launched into space.  It seemed appropriate, since this is my first time working with Mailchimp.  Unfortunately, the chimps whose appearances are in the public domain (if this repository takes off, it might need a logo, after all...) tend to have names that could be applied to any number of things, like Ham here, or the 1910s short film actors Napoleon and Sally.

