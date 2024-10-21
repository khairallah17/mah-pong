from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter



class CreateSocialAccount(DefaultSocialAccountAdapter):
    def save_user(self, request, user, sociallogin):
        user = super().save_user(request, sociallogin)
        
        socialinfo = sociallogin.account
        # i am using sociallogin to extract information from google api
        
        #here i want to get fullename from extracted info
        fullname = socialinfo.extra_data.get('name', '')
        email = socialinfo.extra_Data.get('email', '')
        
        user.fullname = fullname
        user.email = email
        
        user.save()
        
        return user