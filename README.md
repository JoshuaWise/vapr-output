# vapr-output
A Vapr plugin for negotiating and serializing responses

(in progress)

(note about how only the utf-8 charset can be explicitly declared, because explicit charsets are subject to content negotiation. however, other charsets may be sent if they are defined in the payload itself, or if the media type being used has a default charset other than utf-8, such as text/plain and text/enriched which default to us-ascii. it's recommended that such media type include ;charset=utf-8 in order to avoid the less-than-ideal default behavior)
