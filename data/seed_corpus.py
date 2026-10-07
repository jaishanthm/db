"""
Curated Realistic Seed Corpus for Malware Information Database & Threat Intelligence Platform.
Contains rich domain data for top malware families, actors, campaigns, CVEs, MITRE techniques, and case studies.
"""

TACTICS_DATA = [
    {"id": "TA0043", "name": "Reconnaissance", "description": "Gathering information to plan future adversary operations", "order_index": 1},
    {"id": "TA0042", "name": "Resource Development", "description": "Establishing resources to support operations (infrastructure, accounts)", "order_index": 2},
    {"id": "TA0001", "name": "Initial Access", "description": "Techniques used to gain an initial foothold within a network", "order_index": 3},
    {"id": "TA0002", "name": "Execution", "description": "Techniques that result in adversary-controlled code running on a local or remote system", "order_index": 4},
    {"id": "TA0003", "name": "Persistence", "description": "Techniques to maintain access across restarts and changed credentials", "order_index": 5},
    {"id": "TA0004", "name": "Privilege Escalation", "description": "Techniques adversaries use to gain higher-level permissions", "order_index": 6},
    {"id": "TA0005", "name": "Defense Evasion", "description": "Techniques to avoid detection throughout their compromise", "order_index": 7},
    {"id": "TA0006", "name": "Credential Access", "description": "Techniques for stealing credentials like account names and passwords", "order_index": 8},
    {"id": "TA0007", "name": "Discovery", "description": "Techniques an adversary may use to gain knowledge about the system and internal network", "order_index": 9},
    {"id": "TA0008", "name": "Lateral Movement", "description": "Techniques adversaries use to extend access to other systems on the network", "order_index": 10},
    {"id": "TA0009", "name": "Collection", "description": "Techniques to gather information and sources of interest to satisfy adversary objectives", "order_index": 11},
    {"id": "TA0011", "name": "Command and Control", "description": "Techniques adversaries use to communicate with systems under their control", "order_index": 12},
    {"id": "TA0010", "name": "Exfiltration", "description": "Techniques adversaries use to steal data from your network", "order_index": 13},
    {"id": "TA0040", "name": "Impact", "description": "Techniques adversaries use to disrupt availability or compromise integrity by destroying data", "order_index": 14},
]

TECHNIQUES_DATA = [
    {"id": "T1595.001", "tactic_id": "TA0043", "tactic_name": "Reconnaissance", "name": "Scanning IP Blocks", "description": "Adversaries scan public IP ranges to identify vulnerable hosts and listening services.", "url": "https://attack.mitre.org/techniques/T1595/001/"},
    {"id": "T1588.002", "tactic_id": "TA0042", "tactic_name": "Resource Development", "name": "Obtain Tooling", "description": "Adversaries buy or download third-party commercial and open-source tools.", "url": "https://attack.mitre.org/techniques/T1588/002/"},
    {"id": "T1566.001", "tactic_id": "TA0001", "tactic_name": "Initial Access", "name": "Spearphishing Attachment", "description": "Adversaries send targeted emails with malicious attachments to gain code execution.", "url": "https://attack.mitre.org/techniques/T1566/001/"},
    {"id": "T1566.002", "tactic_id": "TA0001", "tactic_name": "Initial Access", "name": "Spearphishing Link", "description": "Adversaries send malicious links leading to credential harvesting or exploit kits.", "url": "https://attack.mitre.org/techniques/T1566/002/"},
    {"id": "T1190", "tactic_id": "TA0001", "tactic_name": "Initial Access", "name": "Exploit Public-Facing Application", "description": "Adversaries exploit software vulnerabilities in internet-accessible servers.", "url": "https://attack.mitre.org/techniques/T1190/"},
    {"id": "T1078", "tactic_id": "TA0001", "tactic_name": "Initial Access", "name": "Valid Accounts", "description": "Adversaries obtain and use credentials of existing domain or cloud accounts.", "url": "https://attack.mitre.org/techniques/T1078/"},
    {"id": "T1059.001", "tactic_id": "TA0002", "tactic_name": "Execution", "name": "PowerShell", "description": "Adversaries abuse PowerShell commands and scripts for code execution.", "url": "https://attack.mitre.org/techniques/T1059/001/"},
    {"id": "T1059.003", "tactic_id": "TA0002", "tactic_name": "Execution", "name": "Windows Command Shell", "description": "Adversaries abuse cmd.exe to execute commands or batch files.", "url": "https://attack.mitre.org/techniques/T1059/003/"},
    {"id": "T1059.005", "tactic_id": "TA0002", "tactic_name": "Execution", "name": "Visual Basic", "description": "Adversaries execute malicious VBScript or VBA macros.", "url": "https://attack.mitre.org/techniques/T1059/005/"},
    {"id": "T1053.005", "tactic_id": "TA0003", "tactic_name": "Persistence", "name": "Scheduled Task", "description": "Adversaries abuse Windows Task Scheduler to execute programs at system startup or regular intervals.", "url": "https://attack.mitre.org/techniques/T1053/005/"},
    {"id": "T1547.001", "tactic_id": "TA0003", "tactic_name": "Persistence", "name": "Registry Run Keys / Startup Folder", "description": "Adversaries add entries in Run/RunOnce registry keys to survive reboots.", "url": "https://attack.mitre.org/techniques/T1547/001/"},
    {"id": "T1543.003", "tactic_id": "TA0003", "tactic_name": "Persistence", "name": "Windows Service", "description": "Adversaries create or modify Windows services to execute malicious payloads persistently.", "url": "https://attack.mitre.org/techniques/T1543/003/"},
    {"id": "T1548.002", "tactic_id": "TA0004", "tactic_name": "Privilege Escalation", "name": "Bypass User Account Control", "description": "Adversaries bypass UAC to elevate privileges without interactive elevation prompt.", "url": "https://attack.mitre.org/techniques/T1548/002/"},
    {"id": "T1068", "tactic_id": "TA0004", "tactic_name": "Privilege Escalation", "name": "Exploitation for Privilege Escalation", "description": "Adversaries exploit software vulnerabilities to elevate system privileges.", "url": "https://attack.mitre.org/techniques/T1068/"},
    {"id": "T1055.012", "tactic_id": "TA0005", "tactic_name": "Defense Evasion", "name": "Process Hollowing", "description": "Adversaries inject malicious code into suspended legitimate process memory space.", "url": "https://attack.mitre.org/techniques/T1055/012/"},
    {"id": "T1027", "tactic_id": "TA0005", "tactic_name": "Defense Evasion", "name": "Obfuscated Files or Information", "description": "Adversaries use encryption or encoding to evade signature-based detection.", "url": "https://attack.mitre.org/techniques/T1027/"},
    {"id": "T1562.001", "tactic_id": "TA0005", "tactic_name": "Defense Evasion", "name": "Disable or Modify Tools", "description": "Adversaries disable or modify security tools, antivirus, and EDR agents.", "url": "https://attack.mitre.org/techniques/T1562/001/"},
    {"id": "T1003.001", "tactic_id": "TA0006", "tactic_name": "Credential Access", "name": "LSASS Memory", "description": "Adversaries dump credentials and NTLM hashes directly from lsass.exe process memory.", "url": "https://attack.mitre.org/techniques/T1003/001/"},
    {"id": "T1555.003", "tactic_id": "TA0006", "tactic_name": "Credential Access", "name": "Credentials from Web Browsers", "description": "Adversaries harvest passwords, cookies, and tokens stored in Chrome/Firefox/Edge databases.", "url": "https://attack.mitre.org/techniques/T1555/003/"},
    {"id": "T1056.001", "tactic_id": "TA0006", "tactic_name": "Credential Access", "name": "Keylogging", "description": "Adversaries log keystrokes to intercept user credentials and cleartext inputs.", "url": "https://attack.mitre.org/techniques/T1056/001/"},
    {"id": "T1082", "tactic_id": "TA0007", "tactic_name": "Discovery", "name": "System Information Discovery", "description": "Adversaries query OS version, architecture, CPU, and hardware specs.", "url": "https://attack.mitre.org/techniques/T1082/"},
    {"id": "T1087.002", "tactic_id": "TA0007", "tactic_name": "Discovery", "name": "Domain Account Discovery", "description": "Adversaries enumerate Active Directory users, groups, and admin privileges.", "url": "https://attack.mitre.org/techniques/T1087/002/"},
    {"id": "T1021.002", "tactic_id": "TA0008", "tactic_name": "Lateral Movement", "name": "SMB/Windows Admin Shares", "description": "Adversaries use SMB administrative shares (C$, ADMIN$) to move laterally across workstations and servers.", "url": "https://attack.mitre.org/techniques/T1021/002/"},
    {"id": "T1560.001", "tactic_id": "TA0009", "tactic_name": "Collection", "name": "Archive via Utility", "description": "Adversaries compress and encrypt stolen data using ZIP, RAR, or 7z prior to exfiltration.", "url": "https://attack.mitre.org/techniques/T1560/001/"},
    {"id": "T1113", "tactic_id": "TA0009", "tactic_name": "Collection", "name": "Screen Capture", "description": "Adversaries capture periodic screenshots of the user desktop session.", "url": "https://attack.mitre.org/techniques/T1113/"},
    {"id": "T1071.001", "tactic_id": "TA0011", "tactic_name": "Command and Control", "name": "Web Protocols (HTTP/HTTPS)", "description": "Adversaries communicate with external C2 servers using standard HTTPS port 443.", "url": "https://attack.mitre.org/techniques/T1071/001/"},
    {"id": "T1573.002", "tactic_id": "TA0011", "tactic_name": "Command and Control", "name": "Asymmetric Cryptography", "description": "Adversaries encrypt C2 beacon traffic using custom RSA/ECDH asymmetric handshakes.", "url": "https://attack.mitre.org/techniques/T1573/002/"},
    {"id": "T1090.003", "tactic_id": "TA0011", "tactic_name": "Command and Control", "name": "Tor Proxy Protocol", "description": "Adversaries route C2 communications through onion services over the Tor network.", "url": "https://attack.mitre.org/techniques/T1090/003/"},
    {"id": "T1041", "tactic_id": "TA0010", "tactic_name": "Exfiltration", "name": "Exfiltration Over C2 Channel", "description": "Adversaries exfiltrate stolen files directly over the established command and control session.", "url": "https://attack.mitre.org/techniques/T1041/"},
    {"id": "T1567.002", "tactic_id": "TA0010", "tactic_name": "Exfiltration", "name": "Exfiltration to Cloud Storage", "description": "Adversaries upload stolen data to MEGA, Dropbox, Google Drive, or AWS S3 buckets.", "url": "https://attack.mitre.org/techniques/T1567/002/"},
    {"id": "T1486", "tactic_id": "TA0040", "tactic_name": "Impact", "name": "Data Encrypted for Impact", "description": "Adversaries encrypt local and network share files to disrupt operations and demand ransom.", "url": "https://attack.mitre.org/techniques/T1486/"},
    {"id": "T1489", "tactic_id": "TA0040", "tactic_name": "Impact", "name": "Service Stop", "description": "Adversaries stop database, backup, and volume shadow copy services before encryption.", "url": "https://attack.mitre.org/techniques/T1489/"},
    {"id": "T1490", "tactic_id": "TA0040", "tactic_name": "Impact", "name": "Inhibit System Recovery", "description": "Adversaries delete volume shadow copies using vssadmin and bcdedit.", "url": "https://attack.mitre.org/techniques/T1490/"},
    {"id": "T1485", "tactic_id": "TA0040", "tactic_name": "Impact", "name": "Data Destruction", "description": "Adversaries overwrite Master Boot Records (MBR) or wipe files to render systems inoperable.", "url": "https://attack.mitre.org/techniques/T1485/"},
]

CAPABILITIES_LIST = [
    ("Credential Dumping", "Credential Access", "Extracts passwords and tokens from memory, browsers, and SAM/LSASS"),
    ("Process Injection", "Defense Evasion", "Executes malicious payloads within the memory space of trusted processes"),
    ("Anti-Analysis / Anti-VM", "Defense Evasion", "Detects hypervisors, debuggers, and sandbox environments to evade sandboxes"),
    ("UAC Bypass", "Privilege Escalation", "Silently elevates process execution privileges without user prompt"),
    ("Ransomware Encryption", "Impact", "Applies AES-256 or ChaCha20 encryption with RSA-4096 asymmetric public key wrapping"),
    ("Shadow Copy Deletion", "Impact", "Deletes Volume Shadow Copies (vssadmin delete shadows /all) to inhibit restore"),
    ("Screen Capture", "Collection", "Silently captures desktop screenshots and transmits them to operator"),
    ("Keylogging", "Credential Access", "Hooks keyboard APIs or reads raw input buffers to log keystrokes"),
    ("Browser Token Stealing", "Credential Access", "Decrypts Chromium and Gecko browser DPAPI masterkeys and exfiltrates cookies"),
    ("Worm / Network Propagation", "Lateral Movement", "Scans local subnet or exploits SMB/RDP to self-replicate across network"),
    ("Tor Onion Routing", "Command and Control", "Connects to hidden services to mask operator IP addresses"),
    ("Tor / HTTPS C2 Beaconing", "Command and Control", "Performs jittered heartbeat check-ins over encrypted TLS"),
    ("Cloud Exfiltration", "Exfiltration", "Exfiltrates archives to cloud providers (Mega, AWS, Dropbox, Telegram API)"),
    ("MBR Overwrite / Wiping", "Impact", "Overwrites the Master Boot Record and partition tables to destroy operating system"),
    ("Dead Man Switch / Self-Delete", "Defense Evasion", "Spawns self-deleting batch files and cleans registry traces on execution end"),
]

PLATFORMS_LIST = [
    ("Windows", "Operating System"),
    ("Linux", "Operating System"),
    ("macOS", "Operating System"),
    ("Android", "Mobile"),
    ("iOS", "Mobile"),
    ("Cloud / Container", "Infrastructure"),
    ("Firmware / IoT", "Embedded"),
]

INDUSTRIES_LIST = [
    ("Healthcare & Public Health", "Hospitals, medical devices, EHR systems"),
    ("Financial Services", "Banks, payment processors, investment firms"),
    ("Critical Infrastructure & Energy", "Power grids, water utilities, oil & gas"),
    ("Government & Public Sector", "Federal, state, defense agencies"),
    ("Technology & SaaS", "Software vendors, cloud service providers, IT managed services"),
    ("Manufacturing & Industrial", "Supply chain, automotive, industrial robotics"),
    ("Defense Industrial Base", "Defense contractors, aerospace, military logistics"),
    ("Retail & E-Commerce", "Point of sale, payment gateways, consumer brands"),
    ("Education & Research", "Universities, research laboratories, academic institutions"),
    ("Transportation & Logistics", "Maritime, rail, aviation, freight networks"),
]

CVES_DATA = [
    {"id": "CVE-2017-0144", "title": "EternalBlue SMB Remote Code Execution", "cvss_score": 9.8, "severity": "Critical", "description": "Flaw in Microsoft Server Message Block 1.0 (SMBv1) protocol allowing remote attackers to execute arbitrary code via crafted packets.", "affected_component": "Microsoft Windows SMBv1"},
    {"id": "CVE-2021-44228", "title": "Log4Shell Apache Log4j JNDI Injection", "cvss_score": 10.0, "severity": "Critical", "description": "Apache Log4j2 JNDI features used in configuration, log messages, and parameters do not protect against attacker controlled LDAP and JNDI endpoints.", "affected_component": "Apache Log4j 2.0-2.14.1"},
    {"id": "CVE-2023-34362", "title": "MOVEit Transfer SQL Injection Vulnerability", "cvss_score": 9.8, "severity": "Critical", "description": "SQL injection vulnerability in Progress MOVEit Transfer web application that could allow an unauthenticated attacker to gain access to the MOVEit database.", "affected_component": "Progress MOVEit Transfer"},
    {"id": "CVE-2023-2868", "title": "Barracuda Email Security Gateway Command Injection", "cvss_score": 9.8, "severity": "Critical", "description": "Remote command injection vulnerability resulting from incomplete input sanitation of tar file attachments.", "affected_component": "Barracuda ESG Appliance"},
    {"id": "CVE-2024-3400", "title": "Palo Alto PAN-OS Command Injection", "cvss_score": 10.0, "severity": "Critical", "description": "Arbitrary command injection vulnerability in the GlobalProtect feature of Palo Alto Networks PAN-OS software allows an unauthenticated attacker to execute code with root privileges.", "affected_component": "Palo Alto GlobalProtect"},
    {"id": "CVE-2024-21762", "title": "Fortinet FortiOS Out-of-bounds Write RCE", "cvss_score": 9.8, "severity": "Critical", "description": "Out-of-bounds write vulnerability in FortiOS sslvpnd allows a remote unauthenticated attacker to execute arbitrary code via specially crafted HTTP requests.", "affected_component": "FortiOS SSL VPN"},
    {"id": "CVE-2021-26855", "title": "Microsoft Exchange Server SSRF (ProxyLogon)", "cvss_score": 9.8, "severity": "Critical", "description": "Server-side request forgery vulnerability in Microsoft Exchange Server that allows an attacker to bypass authentication and execute code as SYSTEM.", "affected_component": "Microsoft Exchange Server 2013/2016/2019"},
    {"id": "CVE-2020-1472", "title": "Netlogon Elevation of Privilege (Zerologon)", "cvss_score": 10.0, "severity": "Critical", "description": "Unauthenticated attacker with network access to a domain controller can establish a vulnerable Netlogon session connection to obtain domain administrator rights.", "affected_component": "Windows Server Netlogon"},
]
